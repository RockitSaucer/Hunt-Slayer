"""Digitize Black Warrior WMA Zone A/B from OA 2026-27 AREA map PDF render.
Clip to ADCNR official WMA boundary. Output GeoJSON for the app.
"""
import json
import os
from PIL import Image
import numpy as np
from shapely.geometry import shape, mapping, Point, box as sbox
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(ROOT)

gj = json.load(open(os.path.join(ROOT, "bw_boundary.geojson"), encoding="utf-8"))
bnd = make_valid(shape(gj["features"][0]["geometry"]))
print("boundary area", bnd.area, "bounds", bnd.bounds)

im = Image.open(os.path.join(ROOT, "bw_map_page1.png"))
arr = np.array(im.convert("RGB"))
h, w = arr.shape[:2]
print("img", w, h)

# Map panel is left ~62% of the page (legend is right)
left = arr[:, : int(w * 0.62)]
mask = np.any(left < 245, axis=2)
ys, xs = np.where(mask)
x0, x1 = int(xs.min()), int(xs.max())
y0, y1 = int(ys.min()), int(ys.max())
print("content bbox", x0, y0, x1, y1)

pad = 28
cx0, cy0, cx1, cy1 = x0 + pad, y0 + pad, x1 - pad, y1 - pad
crop = arr[cy0:cy1, cx0:cx1]
print("crop", crop.shape)

def rgb_at(lon_frac, lat_frac):
    x = int(lon_frac * (crop.shape[1] - 1))
    y = int((1 - lat_frac) * (crop.shape[0] - 1))
    return crop[y, x]

samples_A = []
samples_B = []
for fx in [0.15, 0.22, 0.28, 0.32]:
    for fy in [0.45, 0.55, 0.62]:
        samples_A.append(rgb_at(fx, fy))
for fx in [0.72, 0.78, 0.85]:
    for fy in [0.4, 0.5, 0.6]:
        samples_B.append(rgb_at(fx, fy))
print("A samples", samples_A[:4])
print("B samples", samples_B[:4])

def dist(c, ref):
    return np.sqrt(np.sum((c.astype(float) - ref.astype(float)) ** 2, axis=-1))

A_refs = np.array(samples_A, dtype=float)
B_refs = np.array(samples_B, dtype=float)
pix = crop.astype(float)
da = np.min([dist(pix, r) for r in A_refs], axis=0)
db = np.min([dist(pix, r) for r in B_refs], axis=0)
gray = np.std(pix, axis=2)
brightness = pix.mean(axis=2)
maskA = (da < db) & (da < 55) & (brightness > 90) & (brightness < 210) & (gray > 8)
maskB = (db < da) & (db < 55) & (brightness > 90) & (brightness < 220) & (gray > 8)
print("maskA", int(maskA.sum()), "maskB", int(maskB.sum()))

# Printed graticule extent on map
lon_w, lon_e = -87.5166667, -87.2333333
lat_s, lat_n = 34.2333333, 34.4333333

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

print("cells", len(cellsA), len(cellsB))
if not cellsA or not cellsB:
    raise SystemExit("no cells extracted — adjust color thresholds")

polyA = make_valid(unary_union(cellsA).buffer(0.0009).buffer(-0.0009))
polyB = make_valid(unary_union(cellsB).buffer(0.0009).buffer(-0.0009))
polyA = make_valid(polyA.intersection(bnd))
polyB = make_valid(polyB.intersection(bnd))

covered = make_valid(polyA.union(polyB))
remain = make_valid(bnd.difference(covered))
print("remain area", 0 if remain.is_empty else remain.area)
if not remain.is_empty and remain.area > 1e-6:
    parts = []
    if remain.geom_type == "Polygon":
        parts = [remain]
    elif remain.geom_type == "MultiPolygon":
        parts = list(remain.geoms)
    ca = polyA.centroid if not polyA.is_empty else Point(-87.45, 34.32)
    cb = polyB.centroid if not polyB.is_empty else Point(-87.28, 34.32)
    for p in parts:
        if p.area < 1e-8:
            continue
        if p.centroid.distance(ca) <= p.centroid.distance(cb):
            polyA = make_valid(polyA.union(p))
        else:
            polyB = make_valid(polyB.union(p))

overlap = polyA.intersection(polyB)
if not overlap.is_empty:
    polyB = make_valid(polyB.difference(polyA))

print("A area", polyA.area, "B area", polyB.area, "bnd", bnd.area)
print("coverage", (polyA.area + polyB.area) / bnd.area)

polyA_s = polyA.simplify(0.00025, preserve_topology=True)
polyB_s = polyB.simplify(0.00025, preserve_topology=True)

out = {
    "type": "FeatureCollection",
    "name": "Black Warrior WMA Zones 2026-27",
    "notes": "Digitized from Outdoor Alabama 2026-27 Black Warrior AREA map colors; clipped to ADCNR WMA boundary. Planning aid — confirm official AREA PDF.",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "unit": "Black Warrior WMA",
                "unitMatch": "black warrior",
                "wmaZone": "A",
                "color": "#6fa85c",
                "label": "Black Warrior WMA · Zone A",
            },
            "geometry": mapping(polyA_s),
        },
        {
            "type": "Feature",
            "properties": {
                "unit": "Black Warrior WMA",
                "unitMatch": "black warrior",
                "wmaZone": "B",
                "color": "#d4a05a",
                "label": "Black Warrior WMA · Zone B",
            },
            "geometry": mapping(polyB_s),
        },
    ],
}

out_dir = os.path.join(APP, "data")
os.makedirs(out_dir, exist_ok=True)
path = os.path.join(out_dir, "wma_zones_black_warrior.geojson")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, separators=(",", ":"))
print("wrote", path, "bytes", os.path.getsize(path))
print("A bounds", polyA_s.bounds)
print("B bounds", polyB_s.bounds)

for name, lon, lat in [
    ("west_A", -87.45, 34.32),
    ("east_B", -87.28, 34.30),
    ("north_mid", -87.35, 34.38),
]:
    p = Point(lon, lat)
    print(
        name,
        "inA",
        polyA_s.contains(p) or polyA_s.buffer(0.001).contains(p),
        "inB",
        polyB_s.contains(p) or polyB_s.buffer(0.001).contains(p),
        "inBnd",
        bnd.contains(p),
    )
