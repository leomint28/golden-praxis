# Asset Setup — run once

## Step 1 — Install requirements (one time)

Open a terminal inside the project folder and run:

```
pip install pymupdf python-pptx Pillow
```

## Step 2 — Run the converter

```
python convert_assets.py
```

This will:
- Convert `images/Golden Praxis Logo.pdf` → `images/logo-original.png`
- Extract every brand logo from the `.pptx` file in `images/` → individual `brand-*.png` files

## Step 3 — Rename brand images

After extraction the brand images will be named after their PowerPoint shape names
(e.g. `brand-picture-3.png`).  Rename them to match the keys in `data/partners.json`
so the brands page picks them up automatically, OR update `data/partners.json` to
reference the actual filenames.

## Notes

- The header now has a **white background** so the logo with its white background
  blends in seamlessly — no dark rectangle around the logo.
- The footer still uses `images/logo.svg` (the gold-on-dark version) so it looks
  correct on the dark footer background.
- If `logo-original.png` is not yet generated, all pages automatically fall back
  to `images/logo.svg` via the `onerror` attribute on each `<img>` tag.
