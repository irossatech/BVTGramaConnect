"""Compare prototype and port screenshots: share of pixels that differ, per screen.

    python tools/visual_diff.py <shots folder>

Data differs by design (real data instead of mock data), so a non-zero share
is expected. The share is a pointer to which screens to look at side by side.
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops

shots = Path(sys.argv[1])
pairs = [
    ("01-login", "01-login"),
    ("02-otp", "02-change-password"),
    ("03-dashboard", "03-dashboard"),
    ("04-geography", "04-geography"),
    ("05-users", "05-users"),
    ("06-add-user", "06-add-user"),
    ("07-posts", "07-posts"),
    ("08-post-panel", "08-post-panel"),
    ("09-reports", "09-reports"),
    ("10-audit", "10-audit"),
    ("11-settings", "11-settings"),
]
print("| Screen | Pixels that differ |")
print("|---|---|")
for proto_name, port_name in pairs:
    a = Image.open(shots / f"proto-{proto_name}.png").convert("RGB")
    b = Image.open(shots / f"port-{port_name}.png").convert("RGB")
    if a.size != b.size:
        print(f"| {port_name} | size {a.size} vs {b.size} |")
        continue
    diff = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    share = sum(1 for v in diff.getdata() if v) / (a.size[0] * a.size[1])
    print(f"| {port_name} | {share:.1%} |")
