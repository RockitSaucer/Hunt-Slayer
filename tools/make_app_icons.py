"""Generate square app icons from Hunt/Reg wide logos (dark bg + logo)."""
from PIL import Image, ImageDraw
import os
import shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HUNT_PUSH = ROOT
REG_PUSH = os.path.abspath(os.path.join(ROOT, "..", "_push_reg_slayer"))

def make_app_icon(logo_path, out_dir, prefix, bg=(10, 12, 9, 255)):
    os.makedirs(out_dir, exist_ok=True)
    logo = Image.open(logo_path).convert("RGBA")
    sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024]
    for s in sizes:
        canvas = Image.new("RGBA", (s, s), bg)
        draw = ImageDraw.Draw(canvas)
        m = max(1, s // 64)
        try:
            draw.rounded_rectangle(
                [m, m, s - m - 1, s - m - 1],
                radius=max(2, s // 8),
                outline=(229, 154, 24, 100),
                width=max(1, s // 128),
            )
        except Exception:
            draw.rectangle([m, m, s - m - 1, s - m - 1], outline=(229, 154, 24, 100), width=max(1, s // 128))
        pad = int(s * 0.09)
        box = s - pad * 2
        lw, lh = logo.size
        scale = min(box / float(lw), box / float(lh))
        nw, nh = max(1, int(lw * scale)), max(1, int(lh * scale))
        resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
        x = (s - nw) // 2
        y = (s - nh) // 2
        canvas.paste(resized, (x, y), resized)
        canvas.save(os.path.join(out_dir, "%s-%s.png" % (prefix, s)), "PNG", optimize=True)

    ico_imgs = []
    for s in (16, 32, 48, 64, 128, 256):
        ico_imgs.append(Image.open(os.path.join(out_dir, "%s-%s.png" % (prefix, s))).convert("RGBA"))
    ico_path = os.path.join(out_dir, "%s.ico" % prefix)
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=[(im.width, im.height) for im in ico_imgs],
        append_images=ico_imgs[1:],
    )
    Image.open(os.path.join(out_dir, "%s-512.png" % prefix)).save(os.path.join(out_dir, "%s.png" % prefix))
    print("wrote", prefix, "to", out_dir)


def main():
    hunt_logo = os.path.join(HUNT_PUSH, "hunt-slayer-logo.png")
    reg_logo = os.path.join(HUNT_PUSH, "reg-slayer-logo.png")
    if not os.path.isfile(reg_logo):
        reg_logo = os.path.join(REG_PUSH, "reg-slayer-logo.png")

    hunt_out = os.path.join(HUNT_PUSH, "icons", "app")
    reg_out = os.path.join(REG_PUSH, "icons", "app")
    make_app_icon(hunt_logo, hunt_out, "hunt")
    make_app_icon(reg_logo, reg_out, "reg")

    # Each push folder gets both brands (sister links / shared assets)
    for name in os.listdir(hunt_out):
        if name.startswith("hunt"):
            shutil.copy2(os.path.join(hunt_out, name), os.path.join(reg_out, name))
    for name in os.listdir(reg_out):
        if name.startswith("reg"):
            shutil.copy2(os.path.join(reg_out, name), os.path.join(hunt_out, name))
    print("done")


if __name__ == "__main__":
    main()
