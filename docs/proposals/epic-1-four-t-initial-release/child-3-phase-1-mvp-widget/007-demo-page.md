# Stage 7: Demo Page

**Objective:** Create `index.html` — static page that renders the widget with example data
**Duration:** ~0.5 session
**Dependencies:** Stage 6

---

## Step 7.1: `index.html`

**Action:** Create minimal static demo page

**Requirements:**
- No build step required to open
- Works with CDN ECharts AND with a local ECharts copy
- Data loaded from `4t-data/example/manifest.json` (relative path)
- Widget initialised with `lang: 'en'` (switchable to `'ru'`)

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>four-t demo</title>
  <style>
    /* minimal reset + container sizing */
  </style>
</head>
<body>
  <div id="widget" style="width: 100%; height: 460px;"></div>

  <!-- Option A: CDN -->
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script>

  <!-- Option B: local (uncomment when CDN unavailable) -->
  <!-- <script src="./echarts.min.js"></script> -->

  <script type="module">
    import { FourT } from './4t-widget/widget.js'

    FourT.init(document.getElementById('widget'), {
      dataUrl: './4t-data/example/manifest.json',
      lang: 'en'
    })
  </script>
</body>
</html>
```

---

## Step 7.2: Local ECharts copy

**Action:** Download `echarts.min.js` into repo root for offline use

```bash
curl -o echarts.min.js \
  https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js
```

Add to `.gitignore` (optional — or commit for guaranteed offline use).

---

## Step 7.3: Manual acceptance test

Open `index.html` via a local HTTP server (not `file://` — fetch requires HTTP):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

**Acceptance checklist:**
- [ ] L1 renders 5 tracks (4 dimmed as placeholder)
- [ ] Click on "Programming Languages" → flip animation → L2 with 9 threads
- [ ] Click on "Python" → flip animation → L3 timeline (grows from zero)
- [ ] dataZoom slider visible and functional
- [ ] Click on a timeline bar → flip → L4 bubble chart (or "no data" message)
- [ ] Breadcrumb shows correct path at each level
- [ ] Clicking breadcrumb navigates back correctly
- [ ] Dark mode toggle (if page has one) re-renders correctly
- [ ] Window resize redraws chart
- [ ] Console: no errors

---

## Definition of Done

- `index.html` created in repo root
- All 10 acceptance checklist items pass
- Works with CDN ECharts (online)
- Works with local `echarts.min.js` (offline)
- Phase 1 deliverable achieved: standalone widget, no Hugo required
