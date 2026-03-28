# Stage 3 Progress: State & Navigation

**Issue:** #3 — Phase 1: MVP Widget Extraction
**Stage:** 3 of 7
**Status:** Complete
**Commit:** be50a79

---

## Deliverables

| File | Status |
|------|--------|
| `4t-widget/core/state.js` | ✓ Created |
| `4t-widget/core/nav.js` | ✓ Created |

---

## Verification

### Step 3.1 — state.js
- `initState(config, data).stack.length === 1` ✓
- `initState` with `entry: 'track'` → `{ type: 'track' }` frame ✓
- `initState` with `entry: 'thread'` → `{ type: 'thread', trackId: ... }` frame ✓
- `pushLevel(state, frame).stack.length === state.stack.length + 1` ✓
- Original state not mutated after `pushLevel` ✓
- `popTo(state, 0).stack.length === 1` ✓
- `setLang(state, 'ru').lang === 'ru'`, original unchanged ✓

### Step 3.2 — nav.js
- `resolveNext({ on_click: null }, 'track') === null` (terminal) ✓
- `resolveNext({}, 'track') === 'thread'` (default chain) ✓
- `resolveNext({ on_click: 'tools' }, 'thread') === 'tools'` (skip timeline) ✓
- `canDrillDown({ on_click: null }, 'track') === false` ✓
- `getTrack(data, 'languages').id === 'languages'` ✓
- `getThread(data, 'languages', 'python').id === 'python'` ✓
- `buildNextFrame('thread', trackEntity, params, state)` → `{ type: 'thread', trackId }` ✓
- `buildNextFrame('tools', ...)` → includes `periodMs` from timeline ✓
