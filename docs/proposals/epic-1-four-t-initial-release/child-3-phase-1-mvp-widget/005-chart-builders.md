# Stage 5: Chart Builders

**Objective:** Extract four chart option builders from prototype as pure functions
**Duration:** ~1 session
**Dependencies:** Stage 1 (i18n.js, scale.js), Stage 2 (LoadedData types)

---

## Common contract

Each builder is a **pure function** — no DOM access, no side effects.

```
(data, config) => EChartsOption
```

`config` always contains `lang: string` for i18n resolution.

Color helpers (`hexToRgb`, `shade`, `rgba`) extracted into a shared `core/color.js` or
inlined at the top of each builder file.

---

## Step 5.1: `charts/L1_tracks.js`

**Source:** `optL1()` in prototype

**Signature:**
```js
export const buildL1Option = (tracks, lang) => EChartsOption
```

**Key behaviours:**
- Placeholder tracks rendered as dimmed bars (`opacity: 0.22`, value `0.4`) — non-clickable
- Label above each bar shows level + first word of scale division name
- `animation: true` on first render, `false` on theme switch re-render (caller controls)

---

## Step 5.2: `charts/L2_threads.js`

**Source:** `optL2()` in prototype

**Signature:**
```js
export const buildL2Option = (track, lang) => EChartsOption
```

**Key behaviours:**
- Threads sorted by level descending
- Archive threads rendered at reduced opacity (`0.42`)
- `shade(color, i, total)` used for colour gradient across bars

---

## Step 5.3: `charts/L3_timeline.js`

**Source:** `optL3()` and `growL3()` in prototype

**Signature:**
```js
export const buildL3Option = (thread, zeroed, lang) => EChartsOption
```

**Key behaviours:**
- `zeroed: true` — bars at 0, line at 0 (used as starting state for grow animation)
- `zeroed: false` — real data (used after grow animation and on theme switch)
- Annotated timeline points rendered with inline labels (white background, border in track colour)
- `dataZoom` — both inside (drag) and slider (bottom)
- Time axis uses `periodToMs(thread.timeline_config.scale, period)` for all points
- Bar click navigable only if `thread.timeline_config.bar_click === 'tools'` and tools exist for that period

---

## Step 5.4: `charts/L4_tools.js`

**Source:** `optL4()` in prototype

**Signature:**
```js
export const buildL4Option = (thread, periodMs, lang) => EChartsOption
```

**Key behaviours:**
- `getToolsAtPeriod(thread, periodMs)` used to resolve snapshot
- Empty state rendered as centred text when no tools found
- Bubble layout: `cols = ceil(sqrt(n))`, `rows = ceil(n/cols)` — grid arrangement
- Symbol size: `level * 18`, minimum 36px
- Labels: tool name + level, white bold text

---

## Definition of Done

- 4 files created in `4t-widget/charts/`
- Each builder is importable as an ES module with no side effects
- `buildL1Option` called with `data.tracks` renders a valid ECharts option (spot check in console)
- Archive threads visible but dimmed in L2
- Zeroed L3 has all values at 0 (verified visually)
- L4 with empty tools shows "no data" text (not an empty chart)
