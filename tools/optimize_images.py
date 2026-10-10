#!/usr/bin/env python3
"""Optimizes heavy WebP product photos without changing filenames or dimensions.

Runs only on the design test branch through GitHub Actions. Keeps original files
when reduction/visual quality thresholds are not met. No external image API.
"""
from __future__ import annotations

from io import BytesIO
from math import log10
from pathlib import Path

from PIL import Image, ImageChops, ImageStat, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "img"
MIN_BYTES = 400_000
MIN_SAVING = 0.15
MIN_PSNR = 36.0
QUALITIES = (80, 84, 88, 92)

def psnr(reference: Image.Image, optimized: Image.Image) -> float:
    a = reference.convert("RGB")
    b = optimized.convert("RGB")
    rms = ImageStat.Stat(ImageChops.difference(a, b)).rms
    mse = sum(x * x for x in rms) / len(rms)
    return float("inf") if mse == 0 else 10 * log10((255 * 255) / mse)

def optimize(path: Path) -> tuple[int, int, str]:
    original_size = path.stat().st_size
    if original_size < MIN_BYTES:
        return original_size, original_size, "small"
    try:
        with Image.open(path) as original:
            original.load()
            if original.width * original.height > 45_000_000:
                return original_size, original_size, "too many pixels"
            pixels = original.copy()
            if pixels.mode not in ("RGB", "RGBA"):
                pixels = pixels.convert("RGBA" if "A" in pixels.getbands() else "RGB")
            # Preserve transparency and dimensions; only re-encode heavier photos.
            for quality in QUALITIES:
                output = BytesIO()
                pixels.save(output, "WEBP", quality=quality, method=6)
                data = output.getvalue()
                if len(data) > original_size * (1 - MIN_SAVING):
                    continue
                with Image.open(BytesIO(data)) as test:
                    if test.size != pixels.size or psnr(pixels, test) < MIN_PSNR:
                        continue
                path.write_bytes(data)
                return original_size, len(data), f"quality={quality}"
            return original_size, original_size, "no acceptable smaller version"
    except (OSError, ValueError) as exc:
        raise RuntimeError(f"Could not safely validate {path.name}: {exc}") from exc

def main() -> None:
    print("Optimizing large product photos (no resizing or renaming)")
    before = after = changed = 0
    for path in sorted(ROOT.glob("*.webp")):
        first, second, reason = optimize(path)
        before += first
        after += second
        changed += first != second
        if first >= MIN_BYTES:
            print(f"{path.name}: {first//1024:,} -> {second//1024:,} KiB ({reason})")
    print(f"RESULT: {changed} images optimized, {before:,} -> {after:,} bytes; saved {before-after:,} bytes")
if __name__ == "__main__":
    main()
