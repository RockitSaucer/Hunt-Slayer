"""Isolate directional location icons → transparent PNGs for party/GPS markers.

Same isolation pipeline as process_pin_icons.py (edge flood-fill, light pass,
silhouette harden, tight crop, 128×128 fit).

Also estimates frontDeg: compass degrees in the PNG where the "nose" points
(0 = up / north in image, 90 = right, 180 = down, 270 = left). Leaflet CSS
rotate uses heading − frontDeg so the nose faces the member's bearing.

Source: Desktop/HuntApp/button icons/location icons/
Output: _push_hunt_slayer/icons/dir/
"""
from __future__ import annotations

import json
import math
import re
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC_DIR = Path(r"C:\Users\Rockit\Desktop\HuntApp\button icons\location icons")
OUT_DIR = Path(r"C:\Users\Rockit\Desktop\HuntApp\_push_hunt_slayer\icons\dir")

# Manual front overrides (id → frontDeg). 0 = front points up in PNG.
# Checked against source art silhouettes (top = 0°, right = 90°, bottom = 180°).
FRONT_OVERRIDES: dict[str, float] = {
    "arrow_head": 0,      # tip up
    "boat": 0,            # bow up (tweak if side-profile)
    "bomb": 225,          # diagonal art: nose lower-left; tip-up needs ~135° CCW
    "bullet": 0,          # tip up / forward
    "capture": 0,
    "car": 0,             # nose up if top-down
    "helicopter": 0,      # nose up
    "prop_plane": 180,    # prop (nose) at bottom of top-down art
    "rocket": 0,          # tip up
    "shuttle": 0,
    "speed_boat": 0,
    "truck": 0,
    "dobbs": 0,           # dir PNG rebaked nose-up (head at top)
    "x_wing": 0,          # nose up
}


def slugify(name: str) -> str:
    n = Path(name).stem.strip()
    n = re.sub(r"[\s\-]+", "_", n)
    n = re.sub(r"[^A-Za-z0-9_]", "", n)
    return n.lower()


def display_name(name: str) -> str:
    return re.sub(r"\s+", " ", Path(name).stem.strip())


def lum(r: int, g: int, b: int) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def sat(r: int, g: int, b: int) -> int:
    return max(r, g, b) - min(r, g, b)


def is_bg_pixel(r: int, g: int, b: int, *, strict: bool = False) -> bool:
    L = lum(r, g, b)
    S = sat(r, g, b)
    mn = min(r, g, b)
    if mn >= 232 and S < 40:
        return True
    if L >= 245 and S < 50:
        return True
    if L >= 220 and S < 28:
        return True
    if not strict and L >= 200 and S < 18:
        return True
    if L >= 235 and S < 55 and mn >= 210:
        return True
    return False


def flood_clear_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            return
        r, g, b, a = px[x, y]
        if is_bg_pixel(r, g, b, strict=False):
            visited[y][x] = True
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)
    for x in range(w):
        for y in (1, 2, h - 2, h - 3):
            if 0 <= y < h:
                try_seed(x, y)
    for y in range(h):
        for x in (1, 2, w - 2, w - 3):
            if 0 <= x < w:
                try_seed(x, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h or visited[ny][nx]:
                continue
            r, g, b, a = px[nx, ny]
            if is_bg_pixel(r, g, b, strict=False):
                visited[ny][nx] = True
                q.append((nx, ny))
            else:
                visited[ny][nx] = True
    return im


def global_clear_light(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            L = lum(r, g, b)
            S = sat(r, g, b)
            if is_bg_pixel(r, g, b, strict=False):
                px[x, y] = (0, 0, 0, 0)
                continue
            if L >= 185 and S < 22:
                if L >= 210:
                    px[x, y] = (0, 0, 0, 0)
                else:
                    alpha = int(max(0, min(255, (210 - L) * (255 / 25))))
                    px[x, y] = (r, g, b, alpha)
            elif L >= 248 and S < 60:
                px[x, y] = (0, 0, 0, 0)
    return im


def harden_silhouette(im: Image.Image) -> Image.Image:
    px = list(im.getdata())
    dark = pale = color = 0
    for r, g, b, a in px:
        if a < 20:
            continue
        L = lum(r, g, b)
        S = sat(r, g, b)
        if S >= 40 and L < 230:
            color += 1
        elif L < 90:
            dark += 1
        elif L > 180:
            pale += 1
    total = dark + pale + color
    if total < 10:
        return im
    if color > total * 0.12:
        return im
    out = im.copy()
    opx = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = opx[x, y]
            if a == 0:
                continue
            L = lum(r, g, b)
            S = sat(r, g, b)
            if L >= 200 and S < 30:
                opx[x, y] = (0, 0, 0, 0)
                continue
            if L <= 30:
                opx[x, y] = (0, 0, 0, 255)
            elif L >= 190:
                opx[x, y] = (0, 0, 0, 0)
            else:
                alpha = int(max(0, min(255, (190 - L) * (255 / 160))))
                opx[x, y] = (min(r, 40), min(g, 40), min(b, 40), alpha)
    return out


def crop_alpha(im: Image.Image, pad: int = 1) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    w, h = im.size
    l = max(0, bbox[0] - pad)
    t = max(0, bbox[1] - pad)
    r = min(w, bbox[2] + pad)
    b = min(h, bbox[3] + pad)
    return im.crop((l, t, r, b))


def to_square(im: Image.Image, size: int = 128, pad_ratio: float = 0.04) -> Image.Image:
    cw, ch = im.size
    if cw <= 0 or ch <= 0:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    content = max(cw, ch)
    pad = max(1, int(content * pad_ratio))
    side = content + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - cw) // 2
    oy = (side - ch) // 2
    canvas.paste(im, (ox, oy), im)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def estimate_front_deg(im: Image.Image) -> float:
    """Estimate which way the icon faces in the PNG (0=up, 90=right).

    Heuristic: among directions of maximum radial extent from the alpha
    centroid, pick the one with the *narrower* cross-section near the tip
    (pointy nose of planes, rockets, bullets, boats).
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    pts: list[tuple[float, float, float]] = []
    for y in range(h):
        for x in range(w):
            a = px[x, y][3]
            if a < 40:
                continue
            wt = a / 255.0
            pts.append((x + 0.5, y + 0.5, wt))
    if len(pts) < 20:
        return 0.0
    tw = sum(p[2] for p in pts)
    cx = sum(p[0] * p[2] for p in pts) / tw
    cy = sum(p[1] * p[2] for p in pts) / tw

    # Sample radial max extent every 5°
    # Image coords: +x right, +y down. Compass: 0=up, clockwise.
    # angle_img from +x axis CCW: math.atan2(-(y-cy), x-cx) then convert
    # better: from up, clockwise: deg = atan2(x-cx, cy-y) * 180/pi
    best: list[tuple[float, float]] = []  # (extent, deg)
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        # unit vector in compass space: 0 up → (0,-1) in image
        ux = math.sin(rad)
        uy = -math.cos(rad)
        ext = 0.0
        for x, y, wt in pts:
            dx, dy = x - cx, y - cy
            proj = dx * ux + dy * uy
            if proj > ext:
                ext = proj
        best.append((ext, float(deg)))
    best.sort(reverse=True)
    # Take top candidates within 8% of max extent (long axis)
    max_ext = best[0][0] or 1.0
    candidates = [d for e, d in best if e >= max_ext * 0.92]
    if not candidates:
        return best[0][1]

    def tip_width(deg: float) -> float:
        rad = math.radians(deg)
        ux = math.sin(rad)
        uy = -math.cos(rad)
        # perpendicular
        px_, py_ = -uy, ux
        # points in outer 25% along this axis
        outer = []
        for x, y, wt in pts:
            dx, dy = x - cx, y - cy
            proj = dx * ux + dy * uy
            if proj < max_ext * 0.70:
                continue
            cross = dx * px_ + dy * py_
            outer.append(cross)
        if len(outer) < 3:
            return 1e9
        return max(outer) - min(outer)

    # Prefer pointier tip among long-axis ends (candidates often ~180° apart)
    # Group into clusters
    scored = [(tip_width(d), d) for d in candidates]
    scored.sort()
    return scored[0][1]


def dominant_color(im: Image.Image) -> str:
    opaque = []
    for r, g, b, a in im.getdata():
        if a < 40:
            continue
        if r > 240 and g > 240 and b > 240:
            continue
        S = sat(r, g, b)
        L = lum(r, g, b)
        weight = max(1, a) * (1 + S / 40.0) * (1.5 if L < 80 else 0.6)
        opaque.append((r, g, b, S, L, weight))
    if not opaque:
        return "#1a1a1a"
    tw = sum(x[5] for x in opaque)
    r = int(sum(x[0] * x[5] for x in opaque) / tw)
    g = int(sum(x[1] * x[5] for x in opaque) / tw)
    b = int(sum(x[2] * x[5] for x in opaque) / tw)
    avg_sat = sum(x[3] * x[5] for x in opaque) / tw
    avg_lum = sum(x[4] * x[5] for x in opaque) / tw
    if avg_sat < 35 and avg_lum < 140:
        return "#1a1a1a"
    if r < 45 and g < 45 and b < 45:
        return "#1a1a1a"
    return f"#{r:02x}{g:02x}{b:02x}"


def process_one(path: Path) -> tuple[Image.Image, str, float]:
    im = Image.open(path)
    im = flood_clear_bg(im)
    im = global_clear_light(im)
    im = harden_silhouette(im)
    im = flood_clear_bg(im)
    im = crop_alpha(im, pad=1)
    squared = to_square(im, 128, pad_ratio=0.04)
    color = dominant_color(squared)
    front = estimate_front_deg(squared)
    return squared, color, front


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for pat in ("*.JPG", "*.jpg", "*.PNG", "*.png", "*.jpeg", "*.JPEG"):
        files.extend(sorted(SRC_DIR.glob(pat)))
    seen = set()
    catalog = []
    for f in files:
        sid = slugify(f.name)
        if not sid or sid in seen:
            continue
        seen.add(sid)
        squared, color, front = process_one(f)
        if sid in FRONT_OVERRIDES:
            front = FRONT_OVERRIDES[sid]
        front = round(front / 5.0) * 5.0  # snap to 5°
        out = OUT_DIR / f"{sid}.png"
        squared.save(out, "PNG", optimize=True)
        name = display_name(f.name)
        catalog.append(
            {
                "id": sid,
                "name": name,
                "src": f"icons/dir/{sid}.png",
                "defaultColor": color,
                "frontDeg": front,
            }
        )
        a = [p[3] for p in squared.getdata()]
        opaque = sum(1 for v in a if v > 20)
        print(f"{name:16} -> {sid}.png  front={front:.0f}°  color={color}  opaque%={100 * opaque / len(a):.1f}")

    catalog.sort(key=lambda x: x["name"].lower())
    meta = OUT_DIR / "_catalog.json"
    with open(meta, "w", encoding="utf-8") as fh:
        json.dump(catalog, fh, indent=2)
    print("done", len(catalog), "dir icons →", OUT_DIR)


if __name__ == "__main__":
    main()
