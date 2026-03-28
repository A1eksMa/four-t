# Data Schema

Schema version: **1.0**

All data files carry `"4t": "1.0"` for version identification.

---

## File structure

```
data/
  manifest.json          Global config, scale definition, track file list
  {track-id}.json        One file per track (e.g. languages.json)
```

---

## `manifest.json`

```json
{
  "4t": "1.0",

  "meta": {
    "title":  { "en": "Competency Map", "ru": "Карта компетенций" },
    "author": "A1eksMa"
  },

  "scale": {
    "id":  "default",
    "min": 1,
    "max": 10,
    "divisions": [
      { "value": 1,  "label": { "en": "Awareness",     "ru": "Осведомлённость"  }, "desc": { "en": "Heard of it, know the niche", "ru": "Слышал, знаю нишу" } },
      { "value": 2,  "label": { "en": "Acquaintance",  "ru": "Знакомство"       }, "desc": { "en": "Read a book / took a course", "ru": "Курс или книга" } },
      { "value": 3,  "label": { "en": "Basic practice","ru": "Базовая практика" }, "desc": { "en": "Snippets, exercises",          "ru": "Сниппеты, учебные задания" } },
      { "value": 4,  "label": { "en": "Advanced study","ru": "Углублённая практика" }, "desc": { "en": "Algorithms, data structures", "ru": "Алгоритмы, структуры данных" } },
      { "value": 5,  "label": { "en": "First project", "ru": "Первый проект"    }, "desc": { "en": "Small app / pet-project",      "ru": "Небольшое приложение / пет-проект" } },
      { "value": 6,  "label": { "en": "Ecosystem",     "ru": "Экосистема"       }, "desc": { "en": "Key frameworks and tooling",   "ru": "Основные фреймворки и тулинг" } },
      { "value": 7,  "label": { "en": "Confident",     "ru": "Уверенное владение" }, "desc": { "en": "Stdlib without docs",        "ru": "Стандартная библиотека без доки" } },
      { "value": 8,  "label": { "en": "Extended",      "ru": "Расширенная практика" }, "desc": { "en": "Non-standard libs, real tasks", "ru": "Нестандартные библиотеки, реальные задачи" } },
      { "value": 9,  "label": { "en": "Idiomatic",     "ru": "Идиомы"           }, "desc": { "en": "Idiomatic code, gotchas",      "ru": "Идиоматический код, типичные ловушки" } },
      { "value": 10, "label": { "en": "Under the hood","ru": "Под капотом"      }, "desc": { "en": "Runtime / compiler / memory model", "ru": "Runtime / компилятор / memory model" } }
    ]
  },

  "style": {
    "theme": "auto"
  },

  "widget": {
    "entry":        "track",
    "entry_track":  null,
    "entry_thread": null
  },

  "tracks": [
    { "id": "languages",        "file": "languages.json",        "order": 1 },
    { "id": "data-engineering", "file": "data-engineering.json", "order": 2 }
  ]
}
```

### `manifest.json` — field reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `4t` | string | yes | Schema version, e.g. `"1.0"` |
| `meta.title` | LocaleString | no | Widget heading |
| `meta.author` | string | no | Data author |
| `scale` | Scale | yes | Shared scale object |
| `style.theme` | `"light"` \| `"dark"` \| `"auto"` | no | Default `"auto"` |
| `widget.entry` | EntityType | no | Starting level. Default `"track"` |
| `widget.entry_track` | string \| null | no | Track `id` — required when `entry` is `"thread"` or deeper |
| `widget.entry_thread` | string \| null | no | Thread `id` — required when `entry` is `"timeline"` or `"tools"` |
| `tracks[].id` | string | yes | Matches track file's `track.id` |
| `tracks[].file` | string | yes | Filename relative to manifest |
| `tracks[].order` | number | no | Display order in L1 chart |

---

## Track file — `{id}.json`

```json
{
  "4t": "1.0",

  "track": {
    "id":       "languages",
    "name":     { "en": "Programming Languages", "ru": "Языки программирования" },
    "color":    "#10b981",
    "level":    8,
    "status":   "active",
    "on_click": "thread",

    "chart": {
      "title":    { "en": "Language proficiency overview", "ru": "Обзор владения языками" },
      "pre_text": null,
      "post_text": null,
      "effects":  { "enter": "flipX", "exit": "flipX" }
    }
  },

  "threads": [
    {
      "id":     "python",
      "name":   { "en": "Python", "ru": "Python" },
      "level":  8,
      "status": "active",
      "on_click": "timeline",

      "chart": {
        "title":    { "en": "Python — growth history", "ru": "Python — история роста" },
        "pre_text": null,
        "post_text": null,
        "effects":  { "enter": "flipY", "exit": "flipY" }
      },

      "timeline_config": {
        "scale":         "quarter",
        "interpolation": "smooth",
        "edge_before":   "zero",
        "edge_after":    "extend",
        "aggregation":   "last",
        "bar_click":     "tools"
      },

      "timeline": [
        { "period": "2022Q4", "level": 2, "annotation": { "en": "Yandex course, basics", "ru": "Курс Яндекс, базовый питон" } },
        { "period": "2023Q3", "level": 4, "annotation": null },
        { "period": "2024Q2", "level": 6, "annotation": null },
        { "period": "2025Q3", "level": 7, "annotation": null },
        { "period": "2026Q1", "level": 8, "annotation": null }
      ],

      "tools": [
        {
          "period": "2024Q2",
          "snapshot": [
            { "name": "Flask",   "level": 4 },
            { "name": "FastAPI", "level": 1 },
            { "name": "Django",  "level": 2 }
          ]
        },
        {
          "period": "2025Q4",
          "snapshot": [
            { "name": "Flask",   "level": 4 },
            { "name": "FastAPI", "level": 6 },
            { "name": "Django",  "level": 4 }
          ]
        }
      ]
    }
  ]
}
```

### Track field reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `track.id` | string | yes | Unique identifier |
| `track.name` | LocaleString | yes | Display name |
| `track.color` | hex string | yes | Track accent color |
| `track.level` | number | yes | Aggregate level for L1 bar |
| `track.status` | `"active"` \| `"placeholder"` | no | Default `"active"`. Placeholder tracks render as dimmed "coming soon" bars and are not clickable |
| `track.on_click` | EntityType \| null | no | Where click goes. Default `"thread"`. Ignored when `status` is `"placeholder"` |
| `track.scale` | Scale \| null | no | Inline scale override for this track. When set, replaces the manifest `scale` for all threads in this track |
| `track.chart` | ChartMeta | no | Title, pre/post text, effects |
| `threads[]` | Thread[] | yes | List of threads in this track |

### Thread field reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique within track |
| `name` | LocaleString | yes | Display name |
| `level` | number | yes | Current proficiency level |
| `status` | `"active"` \| `"archive"` | no | Default `"active"` |
| `on_click` | EntityType \| null | no | Where click goes. Default `"timeline"` |
| `chart` | ChartMeta | no | Title, pre/post text, effects |
| `timeline_config` | TimelineConfig | no | Time scale settings |
| `timeline` | TimelinePoint[] | yes | Ordered sequence of level-over-time points |
| `tools` | ToolSnapshot[] | no | Tool snapshots keyed by period |

### TimelineConfig

| Field | Allowed values | Default | Description |
|-------|---------------|---------|-------------|
| `scale` | `day` `week` `month` `quarter` `year` | `quarter` | Time axis granularity |
| `interpolation` | `step` `linear` `smooth` | `smooth` | How to draw between points |
| `edge_before` | `zero` `extend` `null` | `zero` | Behavior before first point |
| `edge_after` | `zero` `extend` `null` | `extend` | Behavior after last point |
| `aggregation` | `last` `max` `avg` | `last` | When merging cross-scale timelines |
| `bar_click` | `"tools"` \| `null` | `"tools"` | What clicking a timeline bar at L3 does. `null` makes bars non-clickable (L3 becomes a terminal level) |

### ChartMeta

| Field | Type | Description |
|-------|------|-------------|
| `title` | LocaleString \| null | Chart heading (shown above chart) |
| `pre_text` | LocaleString \| null | Narrative text above chart |
| `post_text` | LocaleString \| null | Explanatory text below chart |
| `effects.enter` | effect name | Transition effect when entering this level |
| `effects.exit` | effect name | Transition effect when leaving this level |

---

## Types

### LocaleString

A string that may be provided in one or more languages:

```json
{ "en": "Programming Languages", "ru": "Языки программирования" }
```

A plain string `"Programming Languages"` is also valid and treated as language-neutral.

### EntityType

One of: `"track"` `"thread"` `"timeline"` `"tools"` `null`

`null` means the entity is a terminal node (not clickable).

### Effect names (built-in)

| Name | Description |
|------|-------------|
| `"flipX"` | 3D flip around vertical axis (rotateY) |
| `"flipY"` | 3D flip around horizontal axis (rotateX) |
| `"grow"` | Bars grow from bottom after transition |
| `"none"` | No animation |

---

## Migrations

### 1.0 → future

The `"4t"` field enables forward compatibility. A loader encountering `"4t": "2.0"` on a `1.x` widget will log a warning and attempt best-effort rendering.
