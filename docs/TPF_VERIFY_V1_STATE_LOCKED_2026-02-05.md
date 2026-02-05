# TPF Verify v1 — STATE + LOCK (Restore File)

Status: LOCKED (v1)  
Date: 2026-02-05  
Owner: egal42  
Project: The Pioneer Forest (TPF)

---

## A) Purpose (v1)
TPF Verify v1 is a **client-side file integrity verifier**.

It verifies whether a local file matches a published TPF reference via:
- SHA-256 hash (computed in the browser)
- comparison against public `manifest.json`

No file uploads. No ownership/transaction/environmental claim verification.

---

## B) What v1 DOES / DOES NOT

### DOES
✔ Local SHA-256 hash calculation  
✔ Compare hash to `manifest.json`  
✔ Filename independent (renaming does not matter)  
✔ Works with marketplace renaming (GPM risk test target)  
✔ Results: Ready / Idle / Valid / Invalid  

### DOES NOT
✖ Ownership verification  
✖ Transaction verification  
✖ Wallet signing  
✖ Blockchain calls  
✖ Environmental claim verification  

---

## C) Repo / Deploy Targets

### GitHub repo
- Repo: `egal42/tpf-verify`
- Branch: `main`
- Files at repo root:
  - `verify.html`
  - `manifest.json`
  - `README.md`
  - `manifest_v0_TESTPACK_SCHEMA_ARCHIVED.json`
  - `assets/`
    - `styles.css`
    - `verify.js?v=1`

### Netlify
- Site: `tpf-verify.netlify.app`
- Live URL: `/verify.html`
- Deploy model: manual deploy

---

## D) Current UI + UX Rules (v1)
- TPF logo included in header
- Status chip colors:
  - Ready (green)
  - Valid (green)
  - Invalid (red)
  - Idle (neutral)
- Result box styling changes based on state
- File picker prefers PDFs using `accept="application/pdf,.pdf"`
- Footer includes:
  - `Manifest: manifest.json`
  - `Home · The Pioneer Forest`
  - Scope line: `TPF Verify v1 — SHA-256 file integrity check only.`

---

## E) Verified Item(s) in manifest.json (v1)

### Item 1
- Item: `Elowen — First Edition`
- ID: `TPF-CO2-001`
- Notes: `Original reference PDF (hash-based verification).`
- SHA-256:
  `01c7179681cf555d316c0291bc6b4ebd234b7084a22bc99ea80e3c2013960bff`

---

## F) Local dev / testing
- `python -m http.server 8000`
- `http://localhost:8000/verify.html`

---

## G) Freeze Rule
Any functional change requires **TPF Verify v2**.
v1 must remain reproducible forever.
