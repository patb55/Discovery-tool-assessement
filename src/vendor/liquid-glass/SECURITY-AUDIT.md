# liquid-glass-js — Security Audit

**Audit date:** 2026-05-16
**Auditor:** Claude Opus 4.7
**Auditor request:** Patrick Bayce-Chalvin, session 15
**Source:** https://github.com/dashersw/liquid-glass-js
**Files in this folder:** container.js, button.js, glass.css
**SHA-256 (pinned):**
- container.js: `7080217b7fb7e422d2b1f4043342d34fddafaed0a91b54d3f9105361c0f70d65`
- button.js:    `e8dbc8e96f4f8f0c64da4184e9b341776d8adedd42d788b92f9ad7049a9306e6`
- glass.css:    `99dc2ee94be1e5d76402b3acdb3fe807332f533ef5be71721d5ed022b98fc813`

**License:** Not explicitly stated upstream. Treated as MIT-compatible per inspection; ask upstream maintainer before commercial distribution beyond PBC's customer-facing sites.

## 5-Point Audit Results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Network exfiltration | ✅ PASS | Zero `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, hardcoded URLs |
| 2 | Dynamic code execution | ✅ PASS | Zero `eval`, `Function()`, `importScripts`, `document.write` |
| 3 | Credential / storage access | ✅ PASS | Zero `cookie`, `localStorage`, `sessionStorage`, `credentials`, extension APIs |
| 4 | DOM injection / XSS surface | ✅ PASS | Zero `innerHTML =`, `outerHTML =`, `insertAdjacentHTML`. All DOM construction via `createElement` + `textContent` |
| 5 | Telemetry / tracking | ✅ PASS | Zero analytics, tracking, telemetry, beacon, third-party SDK references |

## What the code actually does

- `container.js`: creates a `<div>` + `<canvas>`, snapshots `document.body` via html2canvas, sets up WebGL with a fragment shader that refracts the snapshot texture to produce the liquid-glass visual
- `button.js`: extends Container with text + click handler; supports nested-glass shader sampling parent container's canvas
- `glass.css`: 53 lines of CSS — base styles for `.glass-container`, `.glass-button`, etc.

## Outside-the-component touches

| Touch | Risk | Verdict |
|---|---|---|
| `html2canvas(document.body)` (line 195) | Captures DOM screenshot in browser memory only. Includes any visible on-screen content (potentially sensitive if used on a form page mid-input). | **ACCEPTABLE.** Snapshot is uploaded to WebGL texture and never transmitted. For Discovery Tool wizard, brief snapshot of visible form fields is technically in memory but never leaves the browser. |
| `window.glassControls?` (lines 561-571, 608-619) | Optional global config knob for debug tweaking | **ACCEPTABLE.** Reads only; no write back to window. Safe. |
| `requestAnimationFrame` render loop | Standard browser animation API | **ACCEPTABLE.** |
| `window.addEventListener('scroll', ...)` (line 659) | Scroll listener to update shader uniform | **ACCEPTABLE.** Passive listener, no side effects. |

## Verdict

**CLEAN — safe to ship in customer-facing PBC repos.** No remediation required.

## Next review trigger

Re-audit if any of these change:
- New version of the upstream `dashersw/liquid-glass-js` is vendored over the pinned SHAs
- Patrick adds glass effects to a page that handles real credentials or payment data (review html2canvas snapshot risk in that specific context)
- Upstream repo changes ownership or license
