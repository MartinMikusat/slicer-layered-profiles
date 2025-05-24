# Slicer Layer Composer – Weekend MVP Plan (Static)

## 1. Why & What  
A proof-of-concept that shows **PrusaSlicer profiles can be built from simple “layers.”**  
Goals:

* **Zero servers / zero accounts** – the whole app runs in-browser and can be opened from a local file or GitHub Pages.  
* **Non-programmer friendly** – drag-and-drop cards, guided tour, undo/redo, instant download.  
* **RFC-ready** – something PrusaSlicer maintainers can test next week.

---

## 2. How It Works (no jargon)

1. **Pick a base profile** – e.g. *MK4 0.4 mm Quality*.  
2. **Add change-cards** – each card tweaks one or more settings (fan speed, temp, etc.).  
3. **Drag cards left → right** – later cards win on conflicts (**last-write-wins**).  
4. **Download** – get a normal Prusa `.ini` file ready for the slicer.

---

## 3. Tiny Tech Stack
React + TypeScript (Vite)
localStorage for saving cards
fast-json-patch for applying changes
Simple INI writer → file download

Everything runs in the browser; zip it up and email it if you like.

---

## 4. Tasks in Plain English

* **Card engine** – apply a card’s JSON patch onto the running profile.  
* **Conflict handling** – when two cards touch the same key, the later card wins; the earlier card shows a tooltip noting the overwrite.  
* **Exporter** – turn the final JSON into `key = value` lines PrusaSlicer expects, then trigger a download.  
* **Local backup** – one “Export Project” button saves all cards as `.json`; an “Import Project” button restores them.  
* **Test drive** – bundle three demo cards so reviewers can click once and see a result.

---

## 5. Quick Wins for Usability & Shareability

1. **First-run tooltip tour** – guided steps (react-joyride) walk users through the basic flow.  
2. **Undo / Redo shortcuts** – Ctrl + Z / Y via a tiny `use-undo` state stack.  
3. **Inline setting preview** – each card shows “Fan 40 % → 60 %”-style chips.  
4. **One-click “Share Project”** – encode the card list as base64 in a URL; no server required.  
5. **Accessibility & theming** – keyboard-draggable cards and automatic light/dark mode.  
6. **Automated RFC artifact** – alongside the INI, auto-generate a Markdown summary of all changes.  
7. **Minimal test harness** – a Vitest test that applies the demo cards and checks the INI against a fixture.

---

## 6. Risks & Checks

| Risk | Why it matters | Mitigation |
|------|----------------|-----------|
| **Time crunch** | Only one weekend | Keep scope razor-thin; drop anything that isn’t core flow |
| **Patch edge cases** | Some keys nested deeply | Start with common keys (temp, speed, fan); document limitations |

---