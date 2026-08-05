"""Regenerate icons/tools/layers.png with slightly thinner stroke lines."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons" / "tools" / "layers.png"
SRC_DIRS = [
    Path(r"C:\Users\Rockit\Desktop\HuntApp\button icons\Tool Icons"),
    ROOT.parent / "button icons" / "Tool Icons",
    Path(r"C:\Users\Rockit\Desktop\TestOffline\icons\tools"),
]


def is_bg(r: int, g: int, b: int, a: int) -> bool:
    if a < 20:
        return True
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    S = max(r, g, b) - min(r, g, b)
    return L >= 210 and S < 40


def load_source() -> Image.Image:
    for d in SRC_DIRS:
        if not d.exists():
            continue
        for p in d.iterdir():
            if not p.is_file():
                continue
            if "layer" in p.stem.lower():
                print("source:", p)
                return Image.open(p).convert("RGBA")
    if OUT.exists():
        print("fallback: existing", OUT)
        return Image.open(OUT).convert("RGBA")
    raise SystemExit("No layers source found")


def main() -> None:
    im = load_source()
    w, h = im.size
    px = im.load()
    ink = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not is_bg(r, g, b, a) and a > 30 and (r + g + b) / 3 < 220:
                ink[y][x] = 1

    # Distance to background (4-connected)
    dist = [[0] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in range(w):
            if ink[y][x] == 0:
                dist[y][x] = 0
                q.append((x, y))
            else:
                dist[y][x] = 10**9
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] > dist[y][x] + 1:
                dist[ny][nx] = dist[y][x] + 1
                q.append((nx, ny))

    total = sum(sum(row) for row in ink)
    # Peel outer ring (keep dist > 1) — thins without skeletonizing
    thr = 1
    kept = sum(1 for y in range(h) for x in range(w) if ink[y][x] and dist[y][x] > thr)
    if total and kept / total < 0.45:
        thr = 0  # keep original if peel too aggressive
        kept = total
        print("peel too aggressive; keeping original thickness")
    else:
        print(f"peel thr={thr}: {kept}/{total} ink pixels")

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            if ink[y][x] and dist[y][x] > thr:
                op[x, y] = (0, 0, 0, 255)

    if out.size != (128, 128):
        out = out.resize((128, 128), Image.Resampling.LANCZOS)
        p2 = out.load()
        for y in range(128):
            for x in range(128):
                r, g, b, a = p2[x, y]
                p2[x, y] = (0, 0, 0, 255) if a > 90 else (0, 0, 0, 0)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
