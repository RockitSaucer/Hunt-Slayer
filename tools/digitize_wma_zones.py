"""
Batch-digitize WMA Zone A/B from OA 2026-27 AREA map PDFs.
Clips color-sampled regions to ADCNR WMA GIS boundaries.
Writes compact rings into wma-zones-data.js for the app.
"""
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

import fitz
import numpy as np
from PIL import Image
from shapely.geometry import Point, box as sbox, shape, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parent
APP = ROOT.parent
PDF_DIR = ROOT / "pdfs"
OUT_JS = APP / "wma-zones-data.js"
OUT_JSON = APP / "data" / "wma_zones_all_compact.json"

GIS_QUERY = (
    "https://conservationgis.alabama.gov/adcnrweb/rest/services/"
    "WildlifeManagementAreas/MapServer/0/query"
)

# PDFs that have Zone A/B legend + zone-specific rules (from prior scan)
MULTI_ZONE_STEMS = [
    "Black_Warrior_Wildlife_Management_Area",
    "James_D_Martin_Skyline_Wildlife_Management_Area",
    "Freedom_Hills_Wildlife_Management_Area",
    "Lauderdale_Wildlife_Management_Area",
    "Hollins_Wildlife_Management_Area",
    "Choccolocco_Wildlife_Management_Area",
    "Forever_Wild_Gothard_AWF_Yates_Lake_WMA",
    "Upper_Delta_Wildlife_Management_Area",
    "Barbour_Wildlife_Management_Area",
]

# Map PDF stem → unitMatch regex fragment + display unit name preference
UNIT_META = {
    "Black_Warrior_Wildlife_Management_Area": {
        "unit": "Black Warrior Wildlife Management Area",
        "unitMatch": "black warrior",
    },
    "James_D_Martin_Skyline_Wildlife_Management_Area": {
        "unit": "James D. Martin - Skyline Wildlife Management Area",
        "unitMatch": "skyline|james\\s*d\\.?\\s*martin",
    },
    "Freedom_Hills_Wildlife_Management_Area": {
        "unit": "Freedom Hills Wildlife Management Area",
        "unitMatch": "freedom\\s*hills",
    },
    "Lauderdale_Wildlife_Management_Area": {
        "unit": "Lauderdale Wildlife Management Area",
        "unitMatch": "lauderdale",
    },
    "Hollins_Wildlife_Management_Area": {
        "unit": "Hollins Wildlife Management Area",
        "unitMatch": "hollins",
    },
    "Choccolocco_Wildlife_Management_Area": {
        "unit": "Choccolocco Wildlife Management Area",
        "unitMatch": "choccolocco",
    },
    "Forever_Wild_Gothard_AWF_Yates_Lake_WMA": {
        "unit": "Forever Wild Gothard - AWF Yates Lake WMA",
        "unitMatch": "yates\\s*lake|gothard",
    },
    "Upper_Delta_Wildlife_Management_Area": {
        "unit": "Upper Delta Wildlife Management Area",
        "unitMatch": "upper\\s*delta",
    },
    "Barbour_Wildlife_Management_Area": {
        "unit": "Barbour Wildlife Management Area",
        "unitMatch": "barbour",
    },
}


def fetch_all_wma_geo():
    url = GIS_QUERY + "?" + urllib.parse.urlencode({
        "where": "1=1",
        "outFields": "Name,Acres,Link,OBJECTID",
        "returnGeometry": "true",
        "outSR": "4326",
        "f": "geojson",
        "resultRecordCount": 200,
    })
    with urllib.request.urlopen(url, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def match_gis_feature(gj, unit_name, unit_match):
    feats = gj.get("features") or []
    re_m = re.compile(unit_match, re.I)
    # Prefer longest name match
    best = None
    best_score = -1
    for f in feats:
        name = (f.get("properties") or {}).get("Name") or ""
        if re_m.search(name):
            score = len(name)
            if re.search(re.escape(unit_name.split()[0]), name, re.I):
                score += 50
            if score > best_score:
                best_score = score
                best = f
    return best


def dist(c, ref):
    return np.sqrt(np.sum((c.astype(float) - ref.astype(float)) ** 2, axis=-1))


def digitize_from_pdf(pdf_path, bnd, meta):
    doc = fitz.open(str(pdf_path))
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    img_path = ROOT / (pdf_path.stem + "_map.png")
    pix.save(str(img_path))
    arr = np.array(Image.open(img_path).convert("RGB"))
    h, w = arr.shape[:2]

    # Map is usually left ~62% of page
    left = arr[:, : int(w * 0.62)]
    mask = np.any(left < 245, axis=2)
    ys, xs = np.where(mask)
    if not len(xs):
        print("  no content", pdf_path.name)
        return []
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    pad = 28
    cx0, cy0, cx1, cy1 = x0 + pad, y0 + pad, x1 - pad, y1 - pad
    if cx1 <= cx0 or cy1 <= cy0:
        print("  bad crop", pdf_path.name)
        return []
    crop = arr[cy0:cy1, cx0:cx1]

    # Georef from official boundary bbox (more reliable than printed ticks)
    minx, miny, maxx, maxy = bnd.bounds
    # Slight pad on map frame vs true boundary
    pad_lon = (maxx - minx) * 0.02
    pad_lat = (maxy - miny) * 0.02
    lon_w, lon_e = minx - pad_lon, maxx + pad_lon
    lat_s, lat_n = miny - pad_lat, maxy + pad_lat

    def rgb_at(lon_frac, lat_frac):
        x = int(np.clip(lon_frac, 0, 1) * (crop.shape[1] - 1))
        y = int(np.clip(1 - lat_frac, 0, 1) * (crop.shape[0] - 1))
        return crop[y, x]

    # Sample Zone A (green-ish left/west) and Zone B (tan east) — OA legend colors
    samples_A, samples_B = [], []
    for fx in [0.18, 0.25, 0.32, 0.38]:
        for fy in [0.4, 0.5, 0.6, 0.7]:
            samples_A.append(rgb_at(fx, fy))
    for fx in [0.62, 0.72, 0.8, 0.88]:
        for fy in [0.4, 0.5, 0.6, 0.7]:
            samples_B.append(rgb_at(fx, fy))

    # Prefer green-ish samples for A and tan-ish for B by filtering
    def is_greenish(c):
        r, g, b = [int(x) for x in c]
        return g > r + 5 and g > b - 20 and 60 < g < 230 and r < 210

    def is_tanish(c):
        r, g, b = [int(x) for x in c]
        return r > g and r > b and r > 150 and b < 180 and (r - b) > 30

    A_refs = np.array([c for c in samples_A if is_greenish(c)] or samples_A, dtype=float)
    B_refs = np.array([c for c in samples_B if is_tanish(c)] or samples_B, dtype=float)

    pix = crop.astype(float)
    da = np.min([dist(pix, r) for r in A_refs], axis=0)
    db = np.min([dist(pix, r) for r in B_refs], axis=0)
    gray = np.std(pix, axis=2)
    brightness = pix.mean(axis=2)
    maskA = (da < db) & (da < 58) & (brightness > 85) & (brightness < 215) & (gray > 6)
    maskB = (db < da) & (db < 58) & (brightness > 85) & (brightness < 225) & (gray > 6)

    H, W = maskA.shape

    def px_to_ll(x, y):
        lon = lon_w + (x + 0.5) / W * (lon_e - lon_w)
        lat = lat_n - (y + 0.5) / H * (lat_n - lat_s)
        return lon, lat

    step = 3
    cellsA, cellsB = [], []
    for y in range(0, H, step):
        for x in range(0, W, step):
            if maskA[y, x]:
                lon0, lat0 = px_to_ll(x, y)
                lon1, lat1 = px_to_ll(x + step, y + step)
                cellsA.append(sbox(min(lon0, lon1), min(lat0, lat1), max(lon0, lon1), max(lat0, lat1)))
            if maskB[y, x]:
                lon0, lat0 = px_to_ll(x, y)
                lon1, lat1 = px_to_ll(x + step, y + step)
                cellsB.append(sbox(min(lon0, lon1), min(lat0, lat1), max(lon0, lon1), max(lat0, lat1)))

    print(f"  cells A={len(cellsA)} B={len(cellsB)}")
    if not cellsA and not cellsB:
        return []

    def build_zone(cells, letter):
        if not cells:
            return None
        poly = make_valid(unary_union(cells).buffer(0.0009).buffer(-0.0009))
        poly = make_valid(poly.intersection(bnd))
        if poly.is_empty or poly.area < 1e-8:
            return None
        return poly

    polyA = build_zone(cellsA, "A")
    polyB = build_zone(cellsB, "B")

    # Assign remaining boundary to nearest zone
    covered = None
    if polyA and polyB:
        covered = make_valid(polyA.union(polyB))
    elif polyA:
        covered = polyA
    elif polyB:
        covered = polyB
    if covered is not None:
        remain = make_valid(bnd.difference(covered))
        if not remain.is_empty and remain.area > 1e-6:
            parts = list(remain.geoms) if remain.geom_type == "MultiPolygon" else [remain]
            ca = polyA.centroid if polyA is not None else Point(bnd.bounds[0], bnd.bounds[1])
            cb = polyB.centroid if polyB is not None else Point(bnd.bounds[2], bnd.bounds[3])
            for p in parts:
                if p.area < 1e-8:
                    continue
                if polyA is not None and (polyB is None or p.centroid.distance(ca) <= p.centroid.distance(cb)):
                    polyA = make_valid(polyA.union(p))
                elif polyB is not None:
                    polyB = make_valid(polyB.union(p))

    if polyA is not None and polyB is not None:
        overlap = polyA.intersection(polyB)
        if not overlap.is_empty:
            polyB = make_valid(polyB.difference(polyA))

    # If one zone missing, don't invent — require both for multi-zone
    if polyA is None or polyB is None or polyA.is_empty or polyB.is_empty:
        print("  incomplete zones A/B — skip unit")
        return []

    cov = (polyA.area + polyB.area) / max(bnd.area, 1e-12)
    print(f"  coverage {cov:.2%} A={polyA.area:.5f} B={polyB.area:.5f}")
    if cov < 0.55:
        print("  low coverage — skip")
        return []

    results = []
    for letter, poly, color in [
        ("A", polyA, "#6fa85c"),
        ("B", polyB, "#d4a05a"),
    ]:
        geom = make_valid(poly.simplify(0.0022, preserve_topology=True))
        if geom.geom_type == "MultiPolygon":
            polys = sorted(geom.geoms, key=lambda x: x.area, reverse=True)
            tot = sum(x.area for x in polys) or 1
            keep = [x for x in polys if x.area > tot * 0.02]
            geom = unary_union(keep) if keep else polys[0]
        rings = []
        if geom.geom_type == "Polygon":
            rings = [[[round(x, 5), round(y, 5)] for x, y in geom.exterior.coords]]
        elif geom.geom_type == "MultiPolygon":
            rings = [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in geom.geoms]
        if not rings:
            continue
        c = geom.centroid
        unit = meta["unit"]
        results.append({
            "unit": unit,
            "unitMatch": meta["unitMatch"],
            "wmaZone": letter,
            "color": color,
            "label": f"{unit} (Zone {letter})",
            "lat": round(c.y, 5),
            "lng": round(c.x, 5),
            "rings": rings,
        })
    return results


def main():
    print("Fetching ADCNR WMA boundaries…")
    gj = fetch_all_wma_geo()
    print("features", len(gj.get("features") or []))

    all_zones = []
    for stem in MULTI_ZONE_STEMS:
        pdf = PDF_DIR / f"{stem}.pdf"
        if not pdf.exists():
            print("missing pdf", stem)
            continue
        meta = UNIT_META.get(stem)
        if not meta:
            continue
        feat = match_gis_feature(gj, meta["unit"], meta["unitMatch"])
        if not feat:
            print("no GIS match", stem)
            continue
        gis_name = (feat.get("properties") or {}).get("Name") or meta["unit"]
        meta = dict(meta)
        meta["unit"] = gis_name  # use official GIS name for display
        bnd = make_valid(shape(feat["geometry"]))
        print("==", gis_name)
        try:
            zones = digitize_from_pdf(pdf, bnd, meta)
        except Exception as e:
            print("  error", e)
            zones = []
        all_zones.extend(zones)
        print("  ->", len(zones), "zones")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(all_zones, separators=(",", ":")), encoding="utf-8")
    js = (
        "// Auto-generated WMA Zone A/B rings from OA 2026-27 AREA maps (clipped to ADCNR boundaries)\n"
        "window.EMBEDDED_WMA_ZONES="
        + json.dumps(all_zones, separators=(",", ":"))
        + ";\n"
    )
    OUT_JS.write_text(js, encoding="utf-8")
    print("wrote", OUT_JS, "bytes", OUT_JS.stat().st_size, "zones", len(all_zones))
    for z in all_zones:
        print(" ", z["unit"][:40], "Zone", z["wmaZone"], "pts", sum(len(r) for r in z["rings"]))


if __name__ == "__main__":
    main()
