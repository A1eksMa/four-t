# Issue #8: Phase 6 — Self-hosted Demo

**Type:** Infrastructure / Deployment
**Status:** In Progress
**Epic:** #1
**Depends on:** #3 (complete), #4 (complete) — partial start before #5

---

## Objective

Deploy the four-t widget and wizard to `a1exma.online` served by nginx, making the
project publicly accessible without any build step.

**Deliverable (full):** `https://a1exma.online` serves `index.html` (full example data);
`https://a1exma.online/wizard` serves `wizard.html`.

---

## Original Roadmap Scope

From `roadmap.md — Phase 6`:

```
- Domain delegated and nginx configured
- index.html (full example data) served at root
- wizard.html served at /wizard
- Deploy script or GitHub Actions pipeline
```

---

## Design Decisions

### D1: Repo-as-webroot (no build step, no copy)

**Decision:** nginx `root` points directly at `/home/a1eksma/github/four-t`.

**Rationale:** The widget is plain ES modules with no bundler required. `index.html`
references `./4t-widget/widget.js` and `./4t-data/example/` via relative paths — all
of which exist in the repo. Copying files to `/var/www/` would create a manual sync
problem: every change would require a re-deploy step. Serving from the repo directly
means any committed change is immediately live.

**Trade-off accepted:** The repo directory must be readable by the nginx worker process
(`www-data`). This is acceptable for a public demo project on a personal server.

**Implication for deploy script:** A deploy script (originally in roadmap scope) is
**not needed** for routine updates — `git pull` in the repo is sufficient. This is
documented as a deviation below.

### D2: wizard.html deferred — Phase 6 split into two stages

**Decision:** Phase 6 is implemented in two stages:
- Stage 1 (now, before Phase 3): nginx + SSL + `index.html` online
- Stage 2 (after Phase 3 / Issue #5): add `location /wizard` route when `wizard.html` exists

**Rationale:** `wizard.html` does not exist yet — it is the deliverable of Phase 3.
Waiting for Phase 3 before starting the deploy would block getting a live demo for
UX design purposes. The infrastructure (nginx config, SSL certificate) is fully
independent of the wizard. Stage 1 is complete and self-contained.

**Issue closure:** Issue #8 is closed after Stage 2, when both `index.html` and
`wizard.html` are publicly accessible.

### D3: No deploy script / no GitHub Actions

**Decision:** Omitting the deploy script and GitHub Actions pipeline originally
specified in `roadmap.md — Phase 6`.

**Rationale:** With repo-as-webroot (D1), deployment of new content is `git pull`.
A shell script wrapping one command adds no value. GitHub Actions would be meaningful
for a build + artifact workflow (e.g., esbuild bundle), but that belongs to Phase 4
(Polish & CDN Delivery), not Phase 6. If a pipeline is needed in the future, it
should be designed as part of Phase 4.

**Deviation recorded:** `roadmap.md` listed "Deploy script or GitHub Actions pipeline"
as a Phase 6 deliverable. This is moved out of scope for Phase 6 with the justification
above.

### D4: Early start — Phase 6 begins before Phase 3

**Decision:** Stage 1 of Phase 6 is implemented before Phase 3 (4t-wizard).

**Rationale:** A live demo is needed to support UX design for the wizard. There are
no technical blockers: DNS is already delegated, nginx is running, `index.html` with
full example data is complete. Starting Phase 6 early provides immediate value without
any risk to the planned sequence — Stage 2 of Phase 6 simply waits for Phase 3 output.

---

## Technical Approach

### nginx configuration

Two server blocks for `a1exma.online`:

1. HTTP (port 80) → permanent redirect to HTTPS
2. HTTPS (port 443) → serve repo root, certbot-managed SSL

```nginx
server {
    listen 443 ssl http2;
    server_name a1exma.online;

    root /home/a1eksma/github/four-t;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Stage 2 (after Phase 3): uncomment when wizard.html exists
    # location /wizard {
    #     try_files /wizard.html =404;
    # }
}
```

### SSL

Obtained via `certbot --nginx -d a1exma.online`. Certbot modifies the nginx config
directly — no webroot files created in the repository.

### File permissions

nginx worker (`www-data`) must be able to read the repo. The repo is owned by
`a1eksma`. Required: `chmod o+x` on each directory in the path, and files readable
by others. This is handled during Stage 1 implementation.

---

## Stages

| # | File | Title | Status |
|---|------|-------|--------|
| 1 | `001-nginx-ssl.md` | nginx config + SSL + index.html live | Complete |
| 2 | `002-wizard-route.md` | /wizard route (after Phase 3) | Planned |
