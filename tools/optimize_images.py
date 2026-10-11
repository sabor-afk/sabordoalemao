#!/usr/bin/env python3
"""Compress WebP product photography for the V10 test site.

Images larger than 1800px are carefully resized for web use (the original
catalog thumbnails are displayed much smaller). Output replaces the same
filename only if visual fidelity and file-size checks both pass.
The GitHub main branch is never touched by this script.
"""
from __future__ import annotations

from io import BytesIO
from math import log10
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1] / "img"
MIN_BYTES = 400_000
MIN_SAVING = 0.15
MAX_SIDE = 1800
MIN_PSNR = 33.5
QUALITIES = (84, 88, 92)

def psnr(reference: Image.Image, optimized: Image.Image) -> float:
    a = reference.convert("RGB")
    b = optimized.convert("RGB")
    rms = ImageStat.Stat(ImageChops.difference(a, b)).rms
    mse = sum(value * value for value in rms) / len(rms)
    return float("inf") if mse == 0 else 10 * log10(255 * 255 / mse)

def optimize(path: Path) -> tuple[int, int, str]:
    original_bytes = path.stat().st_size
    if original_bytes < MIN_BYTES:
        return original_bytes, original_bytes, "already small"
    try:
        with Image.open(path) as original:
            original.load()
            original_size = original.size
            # Match the displayed orientation, and avoid color mode surprises.
            pixels = ImageOps.exif_transpose(original)
            pixels = pixels.convert("RGBA" if "A" in pixels.getbands() else "RGB")
            pixels.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
            web_size = pixels.size

            for quality in QUALITIES:
                output = BytesIO()
                pixels.save(output, format="WEBP", quality=quality, method=5)
                data = output.getvalue()
                if len(data) > original_bytes * (1 - MIN_SAVING):
                    continue
                with Image.open(BytesIO(data)) as candidate:
                    candidate.load()
                    if candidate.size != web_size:
                        continue
                    if pixels.mode == "RGBA":
                        alpha_delta = ImageStat.Stat(
                            ImageChops.difference(pixels.getchannel("A"), candidate.getchannel("A"))
                        ).rms[0]
                        if alpha_delta > 1.5:
                            continue
                    visual_quality = psnr(pixels, candidate)
                    if visual_quality < MIN_PSNR:
                        continue
                path.write_bytes(data)
                return (original_bytes, len(data),
                        f"{original_size} -> {web_size}, q={quality}, PSNR={visual_quality:.1f}dB")
            return original_bytes, original_bytes, f"{original_size}: no candidate passed fidelity check"
    except (OSError, ValueError, MemoryError) as exc:
        raise RuntimeError(f"Could not safely process {path.name}: {exc}") from exc

def main() -> None:
    print("V10 web-ready WebP optimization; maximum edge: 1800px")
    before = after = count = 0
    for path in sorted(ROOT.glob("*.webp")):
        a, b, note = optimize(path)
        before += a
        after += b
        count += a != b
        if a >= MIN_BYTES:
            print(f"{path.name}: {a//1024:,} -> {b//1024:,} KiB ({note})", flush=True)
    print(f"RESULT: {count} images optimized, {before:,} -> {after:,} bytes; saved {before-after:,} bytes", flush=True)

if __name__ == "__main__":
    main()
