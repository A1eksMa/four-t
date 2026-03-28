# Functional Requirements

## FR-1: Widget — visualization

### FR-1.1 Four-level drill-down
The widget renders an interactive chart with up to 4 navigable levels:
- **L1 Track** — overview of all tracks (vertical bar chart)
- **L2 Thread** — threads within a selected track (horizontal bar chart)
- **L3 Timeline** — progress history of a thread (bar + line + annotations)
- **L4 Tool** — tools active during a selected period (bubble chart)

Navigation is triggered by clicking chart elements. Breadcrumb navigation allows returning to any previous level.

### FR-1.2 Configurable depth
Each entity can configure where a click leads (`on_click`):
- A Track may go to Thread, Timeline, Tools, or be non-clickable
- A Thread may go to Timeline, Tools, or be non-clickable
- Depth can be reduced globally (e.g., start at Thread level, skip Tools entirely)

### FR-1.3 Animated transitions
Each level transition uses a configurable visual effect (flip, grow, none). Effects are selected per entity and per direction (enter/exit). The effect registry is extensible.

### FR-1.4 Breadcrumb navigation
A breadcrumb bar shows the current drill-down path. Each item is clickable to navigate back. The breadcrumb adapts to the configured depth.

### FR-1.5 Scale legend
An expandable legend displays all scale divisions with their labels and descriptions.

### FR-1.6 Chart-level text annotations
Each level can optionally display:
- A **title** above the chart
- A **pre-text** block above the chart (narrative context)
- A **post-text** block below the chart
- **Inline annotations** directly on chart data points

All text fields are optional and independently toggleable.

### FR-1.7 Dark mode
The widget follows the system or page theme (light / dark / auto), configurable at init time.

### FR-1.8 Responsive layout
The chart resizes when the container or window dimensions change.

### FR-1.9 DataZoom on Timeline
L3 (Timeline) includes a zoomable time axis — both drag-to-zoom and a slider control.

---

## FR-2: Data model

### FR-2.1 Track
Properties: `id`, `name` (multilingual), `color`, `level` (aggregate), `on_click`, `chart` metadata, list of Threads.

### FR-2.2 Thread
Properties: `id`, `name` (multilingual), `level` (current), `status` (active / archive), `on_click`, `chart` metadata, Timeline points, Tool snapshots, `timeline_config`.

### FR-2.3 Timeline
A sequence of `{ period, level, annotation }` points. The time scale (day / week / month / quarter / year) is configurable per Thread. Rules for interpolation and edge handling are configurable.

### FR-2.4 Tool
A named skill or library with a proficiency level. Tools are grouped in snapshots keyed by period. The widget displays the snapshot most recently before or equal to the selected period.

### FR-2.5 Scale
A first-class object shared across the widget. Contains `min`, `max`, and an array of named divisions. Each division has a `value`, `label`, and `desc`. The scale is defined in `manifest.json` and may be overridden per Track.

---

## FR-3: Multilingual support

### FR-3.1 Content strings
All user-visible content strings (names, annotations, pre/post text) are multilingual objects: `{ "en": "...", "ru": "..." }`.

### FR-3.2 UI strings
Widget UI labels (hints, breadcrumb defaults, legend headers) are loaded from locale files in `4t-widget/i18n/`.

### FR-3.3 Default language
The active language is set at widget init time via the `lang` option. Falls back to `"en"` if a key is missing in the requested locale.

### FR-3.4 Language switcher
The widget optionally renders a language toggle button. Switching language re-renders the current level without reloading data.

---

## FR-4: 4t-wizard

### FR-4.1 Live preview
The wizard embeds the widget as a live preview in the upper portion of the page. Any change to data or config immediately re-renders the preview.

### FR-4.2 Entity management
The wizard provides CRUD for:
- Tracks (add, edit name/color/effects, delete, reorder)
- Threads (add to track, edit all properties, delete)
- Timeline nodes (add/edit/delete period-level-annotation entries)
- Tool snapshots (add/edit/delete period + tool list)

### FR-4.3 Scale editor
The wizard provides a slider bound to scale divisions. Dragging the slider sets the entity's level. Each division is labelled. The scale object itself is editable (add/remove/rename divisions).

### FR-4.4 Property toggles
Each optional property (pre_text, post_text, title, inline annotations) has an on/off toggle. When toggled off, the field is excluded from export.

### FR-4.5 Effects picker
For each transition direction (enter / exit), a dropdown lists all registered effects. Selecting one updates the preview immediately.

### FR-4.6 Language toggle in wizard
The wizard includes a language switcher to preview the widget in each configured language.

### FR-4.7 Export
The wizard can:
- Download a ZIP containing `manifest.json` and all track files
- Copy any individual file as JSON to the clipboard
- Save to browser `localStorage` for resuming later

---

## FR-5: Deployment and integration

### FR-5.1 Static hosting
The widget requires no server. It loads data via `fetch()` from relative or absolute URLs.

### FR-5.2 CDN delivery
The widget is available via jsDelivr from a GitHub Release tag.

### FR-5.3 Local delivery
The widget file can be downloaded and served locally, with no external requests required if ECharts is also bundled.

### FR-5.4 Git submodule
The repository can be used as a git submodule. The integrating project references the widget source directly.

### FR-5.5 Hugo integration
The widget integrates with Hugo multilingual sites by passing `{{ .Lang }}` as the `lang` option.
