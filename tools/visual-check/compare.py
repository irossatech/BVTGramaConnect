"""Compare prototype and port screenshots; write side-by-side images and a summary."""

import json
import sys
from pathlib import Path

from PIL import Image, ImageChops

shots = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

PAGES = ["home", "how", "officials", "faq", "contact", "admin"]
WIDTHS = [375, 1280]
results = []
for width in WIDTHS:
    for page in PAGES:
        a = Image.open(shots / f"prototype-{width}-{page}.png").convert("RGB")
        b = Image.open(shots / f"port-{width}-{page}.png").convert("RGB")
        size_match = a.size == b.size
        h = max(a.height, b.height)
        pa = Image.new("RGB", (a.width, h), "white"); pa.paste(a, (0, 0))
        pb = Image.new("RGB", (b.width, h), "white"); pb.paste(b, (0, 0))
        diff = ImageChops.difference(pa, pb)
        mask = diff.convert("L").point(lambda v: 255 if v > 24 else 0)
        changed = sum(1 for v in mask.getdata() if v)
        total = mask.width * mask.height
        bbox = mask.getbbox()
        results.append({
            "page": page, "width": width,
            "prototype_size": a.size, "port_size": b.size, "same_size": size_match,
            "changed_pixels": changed, "changed_percent": round(100 * changed / total, 4), "diff_box": bbox,
        })
        # Side by side: prototype | port | differences in red, scaled down to keep files small.
        red = Image.new("RGB", pa.size, (255, 0, 0))
        overlay = Image.composite(red, pa.point(lambda v: 255 - (255 - v) // 4), mask)
        sheet = Image.new("RGB", (pa.width * 3 + 20, h), (200, 200, 200))
        sheet.paste(pa, (0, 0)); sheet.paste(pb, (pa.width + 10, 0)); sheet.paste(overlay, (2 * pa.width + 20, 0))
        scale = 0.5 if width == 375 else 0.25
        sheet = sheet.resize((int(sheet.width * scale), int(sheet.height * scale)), Image.LANCZOS)
        sheet.save(out / f"{width}-{page}.png", optimize=True)

(out / "results.json").write_text(json.dumps(results, indent=1), encoding="utf-8")
for r in results:
    print(f"{r['width']:>5} {r['page']:<10} same_size={r['same_size']} changed={r['changed_pixels']} ({r['changed_percent']}%) box={r['diff_box']}")
