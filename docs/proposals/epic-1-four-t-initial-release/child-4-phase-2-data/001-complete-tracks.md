# Stage 1: Complete All Track Files

**Objective:** Fill 4 placeholder tracks with real data; update manifest
**Duration:** 1–2 sessions
**Dependencies:** Schema stable (Issue #2 complete)

---

## Step 1.1: `data.json` — Data & Analytics

**Threads to include (suggested, adjust to actual experience):**

| Thread | Status | Level | Period range |
|--------|--------|-------|--------------|
| SQL | active | 9 | 2018Q3–2026Q1 |
| PostgreSQL | active | 8 | 2019Q1–2026Q1 |
| ClickHouse | active | 7 | 2021Q3–2026Q1 |
| Apache Spark | active | 6 | 2020Q1–2026Q1 |
| Apache Kafka | active | 5 | 2021Q1–2026Q1 |
| dbt | active | 6 | 2022Q1–2026Q1 |
| Airflow | active | 5 | 2021Q1–2026Q1 |
| Pandas / NumPy | active | 8 | 2019Q1–2026Q1 |

**Requirements:**
- Each thread: ≥ 3 timeline points, `timeline_config` explicit
- At least SQL and PostgreSQL: `tools[]` snapshots with libraries/drivers
- `track.level` = max thread level (e.g., 9 for SQL-heavy profile)
- `track.status` = `"active"`

---

## Step 1.2: `infra.json` — Infrastructure

**Threads to include:**

| Thread | Status | Level | Period range |
|--------|--------|-------|--------------|
| Docker | active | 8 | 2019Q1–2026Q1 |
| Linux / Bash | active | 7 | 2018Q3–2026Q1 |
| Git | active | 8 | 2018Q3–2026Q1 |
| CI/CD (GitHub Actions) | active | 6 | 2020Q3–2026Q1 |
| nginx | active | 5 | 2020Q1–2026Q1 |
| Kubernetes | active | 4 | 2022Q1–2026Q1 |

**Requirements:**
- Docker and Linux: `tools[]` snapshots (e.g., docker-compose, systemd, cron)

---

## Step 1.3: `systems.json` — Systems & Networks

**Threads to include:**

| Thread | Status | Level | Period range |
|--------|--------|-------|--------------|
| TCP/IP | active | 6 | 2018Q3–2026Q1 |
| HTTP/REST | active | 7 | 2019Q1–2026Q1 |
| gRPC | active | 4 | 2022Q1–2026Q1 |
| Message queues | active | 5 | 2021Q1–2026Q1 |
| Distributed systems concepts | active | 5 | 2020Q1–2026Q1 |

---

## Step 1.4: `foundations.json` — Foundations

**Threads to include:**

| Thread | Status | Level | Period range |
|--------|--------|-------|--------------|
| Algorithms & Data Structures | active | 6 | 2018Q3–2026Q1 |
| OOP / Design patterns | active | 6 | 2018Q3–2026Q1 |
| Functional programming | active | 5 | 2020Q1–2026Q1 |
| Relational model | active | 8 | 2018Q3–2026Q1 |
| Statistics / Probability | active | 5 | 2019Q1–2026Q1 |

---

## Step 1.5: Update `manifest.json`

**Action:** Change all 4 placeholder tracks to active

```json
"tracks": [
  { "id": "languages",    "file": "languages.json",    "order": 1 },
  { "id": "data",         "file": "data.json",         "order": 2 },
  { "id": "infra",        "file": "infra.json",        "order": 3 },
  { "id": "systems",      "file": "systems.json",      "order": 4 },
  { "id": "foundations",  "file": "foundations.json",  "order": 5 }
]
```

Also update `track.level` in each file to reflect the filled-in data.

---

## Verification

- [ ] All 5 tracks load without errors in `index.html`
- [ ] L1 shows 5 coloured bars (none dimmed as placeholder)
- [ ] Each track drills down to ≥ 5 threads
- [ ] L3 timeline renders for each thread
- [ ] All `name` fields are LocaleString (en + ru), not plain strings
- [ ] At least 4 threads across tracks have `tools[]` with snapshots

---

## Definition of Done

- All 4 files filled with real data, committed
- `manifest.json` updated (all `status: "active"`)
- `index.html` acceptance test passes for all 5 tracks
