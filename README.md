# ChatGPT Answer Collapser — README

A small Chrome extension that makes long ChatGPT conversations easy to navigate by adding a searchable/scrollable sidebar with question indexes, per-answer collapse/expand controls, **Jump** buttons, a global **Expand All / Collapse All** control, and a floating restore button when the sidebar is hidden. Works with ChatGPT light/dark theme.

---

## Features

* Collapsible answers (collapsed by default except the latest answer)
* Per-answer **Jump** button (jumps to the answer)
* Per-answer **Expand / Collapse** button (in sidebar and inside answers)
* Global **Expand All / Collapse All** button
* Searchable sidebar
* Question sorting (Ascending / Descending) in sidebar
* Sidebar can be collapsed to the right;
* Dark / Light mode compatibility

---

## Repository files

```
manifest.json         # Chrome extension manifest (v3)
content.js            # Content script injected into ChatGPT pages
styles.css            # Extension styles (sidebar + buttons)
README.md             # (this file)
```
---

## Quick install (any PC) — recommended: Load unpacked

> **Prerequisite:** Google Chrome (or Chromium-based browser such as Edge). Developer Mode is required for loading unpacked extensions.

1. **Clone or download** the repository to your machine:

```bash
# clone (recommended if you have git):
git clone https://github.com/yashginoya/chatgpt-collapser
cd chatgpt-collapser

# or download ZIP from GitHub and extract it
```

2. Open Chrome and go to `chrome://extensions/`.

3. Enable **Developer mode** (toggle at top-right).

4. Click **Load unpacked** → select the repository folder (the folder that contains `manifest.json`).

5. After loading, open ChatGPT

6. Open DevTools (F12) → Console and verify you see the startup message:

```
ChatGPT Collapser loaded ✅
```

If you see that message, the content script injected correctly and the sidebar should appear.

---
