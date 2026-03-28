# Issue #4: Phase 2 — Example Data Completeness

**Type:** Documentation / Data
**Status:** Ready to start
**Epic:** #1
**Depends on:** #2 (schema stable)
**Parallel with:** #3 (Phase 1)

---

## Objective

Fill all 5 track files with real competency data. Upgrade placeholder tracks to active.
All content fields bilingual (en + ru). Result: a complete, representative example
that demonstrates the full widget capability.

---

## Source data

Existing `data/competency.json` in A1eksMa.github.io (`main` branch) contains
the original data for the `languages` track (9 threads). The remaining 4 tracks
are documented in the portfolio but not yet in the JSON.

---

## Target state

| Track | File | Threads | Tools data |
|-------|------|---------|-----------|
| Programming Languages | `languages.json` | 9 (complete) | Python: 6 snapshots |
| Data & Analytics | `data.json` | 8–10 | At least 2 threads with tools |
| Infrastructure | `infra.json` | 6–8 | At least 2 threads with tools |
| Systems & Networks | `systems.json` | 5–7 | At least 1 thread with tools |
| Foundations | `foundations.json` | 5–7 | Optional |

---

## Schema compliance requirements

All thread data must satisfy:
- `name`: `{ "en": "...", "ru": "..." }` (LocaleString, not plain string)
- `timeline`: at least 3 points spanning 2018–2026
- `timeline_config`: explicit values (scale, interpolation, edges)
- `status`: `"active"` or `"archive"` (no more `placeholder` at thread level)
- `level`: integer 1–10, consistent with last timeline point

---

## Stage

### Stage 1: Complete all 5 track files
See `001-complete-tracks.md`
