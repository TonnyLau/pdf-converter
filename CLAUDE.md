# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: PDFSwitch (a.k.a. LuxPDF / PDFSwift)

A free, open-source, **100% client-side** web app for PDF, document, and image workflows. Files never leave the browser. Published at https://luxpdf.com (canonical: pdfonly.top). AGPL-3.0 licensed. Funded by donations/sponsors via `.github/FUNDING.yml`.

**Core invariant:** No backend. All processing happens in the user's browser. No uploads, no accounts, no file-size limits.

## Local Development

This is a **static site** with **no build step, no package.json, no test runner, and no linter**. Pick any of:

- VS Code Live Server
- `python -m http.server` (in this directory)
- `npx serve`

Then open `index.html`. There is no compile / test / lint command to run.

Deployment is Cloudflare Pages — see `wrangler.jsonc` (`pages_build_output_dir: "."` means the repo root is the deployable artifact).

## Architecture (Big Picture)

The original `script.js` was deliberately **split into 8 files** (see header comments like `/* Split from script.js: base PDFConverterPro class */`). All of these files attach methods to a single global `PDFConverterPro` class via `Object.assign(PDFConverterPro.prototype, {...})`. This means **there is one giant class** spread across ~10,000 lines — adding a feature usually means picking the right split file, not creating a new module.

### Script load order — defined in `script.js`

`script.js` is the entry point included by every page. It sequentially appends these scripts (in this order, with cache-buster `?v=1.4`):

1. `scripts/luxpdf-theme.js` — theme system (7 themes, `data-theme` on `<html>`, persisted in `localStorage` under `luxpdf-theme`).
2. `scripts/pdf-converter-base.js` — defines the `PDFConverterPro` class shell with state (`currentTool`, `uploadedFiles`, `isReversed`, watermark preview tokens, etc.).
3. `scripts/pdf-converter-ui.js` — UI binding: drag-and-drop, file list, **the `getToolConfig(toolName)` table** (titles, accept strings, descriptions for every tool — `pdf-converter-ui.js:414-600`), notifications, FAQ accordion, modals.
4. `scripts/pdf-converter-workflows.js` — multi-file pipelines: `preprocessPptx`, watermark rendering with cancellation tokens, drag-resize, ZIP packaging for batch downloads.
5. `scripts/pdf-converter-converters-a.js` / `…-b.js` — the actual conversion logic for each tool (image↔PDF, text→PDF, docx, rtf, pptx, heif, webp, svg, etc.). Split in two because a/b was the size limit.
6. `scripts/pdf-converter-tools.js` — generic helpers: DOM→PDF via canvas slicing (`appendCanvasToPdf`), render-asset waiting (`waitForRenderedContentAssets`), lazy script loaders (`loadFirstAvailableScript`), and per-tool processing switch.
7. `scripts/luxpdf-site-init.js` — landing page wiring, tool grid, i18n (9 languages including RTL Persian), FAQ accordion, Plausible analytics.

**When you change a class method, edit the split file, not a non-existent "main" script.** The `?v=1.4` cache-buster in `script.js` must be bumped when shipping changes (search for `version = '1.4'`).

### HTML page pattern

Every tool page (`<tool-name>.html`) is a near-duplicate of the same template:
- `header` with logo, nav, language switcher, theme switcher (injected by `luxpdf-theme.js`)
- `main > section.tools-section` with `upload-area`, `file-list`, `tool-options`, `process-btn`, `progress-container`, `results-section`
- `section.content-section` with "What is PDFSwitch / Why / How-to / FAQ" marketing copy
- `section.related-tools-section` linking to related tools
- `footer`

The page filename **is** the tool key. `setupToolSpecificPage()` in `pdf-converter-ui.js` infers `currentTool` from `window.location.pathname` when not set otherwise — so a new tool needs (1) an `<tool>.html` page, (2) a `getToolConfig` entry in `pdf-converter-ui.js`, and (3) a `case` branch in the processing switch in `pdf-converter-tools.js`.

### Vendor libraries (local, not CDN for the core ones)

`vendor/` ships these locally — do **not** swap to CDN without checking what the page expects:
- `vendor/jszip/jszip.min.js` — exposes `window.JSZip`
- `vendor/jszip-utils/jszip-utils.min.js`
- `vendor/filereader/filereader.min.js` — fallback for browsers without `Blob.stream()`
- `vendor/pptxjs/{pptxjs.js, divs2slides.js, pptxjs.css}` — PPTX rendering

Other libraries (pdf-lib, pdf.js, pica, mammoth, docx-preview, heic2any) are loaded from CDN via `loadFirstAvailableScript([...])` with **multi-CDN fallback lists** — see `ensureDocxPreviewLib` / `ensureMammothLib` in `pdf-converter-tools.js` for the canonical pattern. Some tools (PPT) require **JSZip v2 compatibility** — see `preprocessPptx` in `pdf-converter-workflows.js`, which detects the API by `typeof loadAsync === 'function'` and handles both flavors.

### State, persistence, and conventions

- `localStorage` keys used: `luxpdf-theme` (theme), `lastUsedTool` (last opened tool on the landing page).
- No router, no SPA — each tool is its own static page.
- `PDFConverterPro.prototype` carries per-instance state (file arrays, drag/resize state, async render cancellation tokens). Watermark preview uses a `watermarkPreviewRenderToken` counter to avoid stale async renders.
- All UI text strings (en + 8 others) live in the `translations` map in `luxpdf-site-init.js:80+`. The landing page's tool grid is the `toolsConfig` array (`luxpdf-site-init.js:599+`).

## Adding a new tool — checklist

1. Copy the closest existing `<tool>.html` (e.g. `merge-pdf.html` is the cleanest template).
2. Add a `getToolConfig('<tool>')` entry in `pdf-converter-ui.js:414-600` (title, accept, description).
3. Add the tool to the `toolsConfig` array in `luxpdf-site-init.js` (labelKey, tool key, icon).
4. Add translations for all 9 languages in `luxpdf-site-init.js` (`en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `fr`, `es`, `tr`, `fa`).
5. Implement the conversion in `pdf-converter-converters-a.js` or `-b.js` (use existing tools as patterns — `appendCanvasToPdf` handles pagination for HTML→PDF).
6. Wire it into the processing switch in `pdf-converter-tools.js`.
7. Add a related-tools entry on the new page (and update the related-tools section of nearby pages).
8. Bump the `version = '1.4'` cache-buster in `script.js` (and the `?v=1.4` on `styles.css` links in HTML).
9. Add a row to the `Readme.md` tool list.

## Conventions specific to this repo

- Tool filenames and `getToolConfig` keys use **kebab-case** (`merge-pdf`, `pdf-to-png`).
- Site is referenced as both **PDFSwitch** (in code/markup) and **LuxPDF / PDFSwift** (in README, theme system, `luxpdf-*` scripts). The internal name is drifting — don't introduce a fourth name.
- Both `pdfonly.top` (canonical in `<link rel="canonical">` and OG tags) and `luxpdf.com` (live in `Readme.md`) appear as the public domain. Match the surrounding file's pattern.
- Plausible analytics: `<script>window.plausible = window.plausible || function () { ... }</script>` is **required** before the deferred Plausible script — it provides a no-op stub. Keep this stub.
- The `.vscode/settings.json` disables Kiro's MCP — don't re-enable unless asked.
- No tests, no CI, no pre-commit hooks. PRs are reviewed manually against `https://github.com/VSRemoter/LuxPDF`.
