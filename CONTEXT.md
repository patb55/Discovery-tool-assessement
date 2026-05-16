---
title: Discovery Tool — L2 workspace context
status: active
last_modified: 2026-05-16
layer: 2-workspace
owner: patrick
repo: https://github.com/patb55/Discovery-tool-assessement
---

# Discovery Tool (discovery-tool-assessment)

**Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase auth · 9-step wizard generating JSON + PDF assessment

## Current state (session 14 close, 2026-05-16)

- Brand-migrated to PBC palette session 13: charcoal/emerald/platinum/cream + Montserrat
- All blue/green/indigo drift purged from `UnifiedDiscoveryTool.tsx`, `TechnicalRequirementsAssessment.tsx`, `NotFound.tsx`
- Shader background wired to 3 render states: login, wizard form steps, results
- **Logo unified session 14:** `PBC-Logo.svg` (mirrors website + presentation `PBCLogo.tsx` ∨+PBC+∧ design, light variant). Legacy `PBC-Logo-Circuit.svg` deleted.
- TypeScript clean; pushed to origin/main

## File map

| File | Purpose |
|---|---|
| `src/components/UnifiedDiscoveryTool.tsx` | Main wizard component (3 render states at lines 580 / 617 / 692) |
| `src/components/TechnicalRequirementsAssessment.tsx` | Alt wizard for technical-only assessment |
| `src/components/effects/BrandShaderGradient*.tsx` | Mirrored from website + presentation |
| `src/assets/PBC-Logo.svg` | Brand-aligned logo (NEW session 14) |
| `src/index.css` | PBC HSL tokens (charcoal/emerald/platinum/cream) + Montserrat |
| `tailwind.config.ts` | charcoal/emerald/platinum/cream + Montserrat font family |
| `src/integrations/supabase/` | Auth + storage backend |
| `src/utils/discoveryExport.ts` | PDF + JSON generation |

## How the wizard renders

`UnifiedDiscoveryTool` has 3 render branches:
1. **Login** (line 580): `!isAuthenticated` — password-gated entry
2. **Results** (line 617): `currentStep === TOTAL_STEPS && scores` — final assessment display
3. **Form steps** (line 692): the 9 wizard steps

All three wrap in `<BrandShaderGradient />` with appropriate variant (hero / contact / section).

## Next likely tasks

- Verify wizard export (PDF + JSON) still renders correctly with new branding
- Add tier display pattern to results page IF it shows recommended platforms
- Performance audit: shader render cost on wizard transitions
- (Optional) Update results page risk-level colors — currently semantic (LOW=accent/emerald, MEDIUM=yellow, HIGH=orange, danger=red) which is OK

## How to verify

```bash
cd discovery-tool-assessment
npm run dev   # Vite at localhost:8080 or next available
npx tsc --noEmit
```
