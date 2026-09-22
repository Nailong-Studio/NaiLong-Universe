#!/usr/bin/env python3
"""Gallery build script: scan wallpapers/ -> thumbs WebP + gallery.json"""
import json
import pathlib
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed, run: pip install Pillow", file=sys.stderr)
    sys.exit(1)

CATEGORIES = ["fullhd", "classic", "special", "phone", "art"]
SRC_ROOT = pathlib.Path("wallpapers")
OUT_THUMB = pathlib.Path("site/public/thumbs")
OUT_JSON = pathlib.Path("site/src/data/gallery.json")
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def build():
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    items = []
    for cat in CATEGORIES:
        src_dir = SRC_ROOT / cat
        if not src_dir.exists():
            print(f"warn: category dir missing: {src_dir}", file=sys.stderr)
            continue
        for p in sorted(src_dir.glob("*.*")):
            if p.suffix.lower() not in ALLOWED_SUFFIXES:
                continue
            # Skip if not a file
            if not p.is_file():
                continue
            thumb = OUT_THUMB / cat / f"{p.stem}.webp"
            thumb.parent.mkdir(parents=True, exist_ok=True)
            try:
                # Incremental: only rebuild if missing or source newer
                need_thumb = not thumb.exists() or p.stat().st_mtime > thumb.stat().st_mtime
                if need_thumb:
                    try:
                        with Image.open(p) as im:
                            # Ensure we handle all modes; convert handled by save
                            # Use copy before thumbnail to avoid modifying original reference
                            im_copy = im.copy()
                            im_copy.thumbnail((400, 400))
                            # If image has transparency, webp handles it; otherwise convert to RGB if needed
                            im_copy.save(thumb, "WEBP", quality=75)
                    except Exception as e:
                        print(f"warn: failed to generate thumb for {p}: {e}", file=sys.stderr)
                        continue

                # Read dimensions from original (need open again for safety after potential failure)
                try:
                    with Image.open(p) as im2:
                        w, h = im2.size
                except Exception as e:
                    print(f"warn: failed to read size for {p}: {e}", file=sys.stderr)
                    continue

                items.append(
                    {
                        "id": f"{cat}/{p.name}",
                        "category": cat,
                        "file": p.name,
                        "src": f"wallpapers/{cat}/{p.name}",
                        "thumb": f"thumbs/{cat}/{p.stem}.webp",
                        "w": w,
                        "h": h,
                        "size": p.stat().st_size,
                        "source": "",
                    }
                )
            except Exception as e:
                print(f"warn: skip {p}: {e}", file=sys.stderr)
                continue

    # Sort for deterministic output
    items.sort(key=lambda x: x["id"])
    OUT_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"generated {len(items)} items")
    return items


if __name__ == "__main__":
    build()
