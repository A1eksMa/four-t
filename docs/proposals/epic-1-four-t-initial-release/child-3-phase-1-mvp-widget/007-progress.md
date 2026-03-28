# Stage 7 Progress: Demo Page

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 7 of 7
**Status:** Complete
**Commit:** 5bf08af

---

## Deliverables

| File | Status |
|------|--------|
| `index.html` | ✓ Created (repo root) |

---

## Acceptance checklist

- [ ] L1 renders 5 tracks (4 dimmed as placeholder)
- [ ] Click on "Programming Languages" → flip animation → L2 with 9 threads
- [ ] Click on "Python" → flip animation → L3 timeline (grows from zero)
- [ ] dataZoom slider visible and functional
- [ ] Click on a timeline bar → flip → L4 bubble chart (or "no data" message)
- [ ] Breadcrumb shows correct path at each level
- [ ] Clicking breadcrumb navigates back correctly
- [ ] Dark mode toggle re-renders correctly
- [ ] Window resize redraws chart
- [ ] Console: no errors

> To verify: `python3 -m http.server 8080` → http://localhost:8080

---

## Notes

- EN/RU language toggle buttons included for manual i18n verification
- Dark mode via `document.documentElement.classList.toggle('dark')`
- CDN ECharts 5.6.0 by default; local `echarts.min.js` option commented in
