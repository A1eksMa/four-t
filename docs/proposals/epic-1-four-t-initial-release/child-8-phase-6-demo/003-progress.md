# Stage 3 Progress: Docker, remote server, nginx proxy, SSL, GitHub Actions

**Issue:** #8
**Stage:** 003
**Status:** Complete ✅
**Date:** 2026-03-29

---

## Result

`https://a1exma.online` and `https://a1exma.online/wizard.html` are served from a
Docker container on `195.2.67.202` behind an nginx reverse proxy with TLS.
GitHub Actions deploys automatically on every push to `main`.

---

## Checklist

### Remote server setup
- [x] Repository cloned to `/home/a1eksma/github/four-t`
- [x] Data volume directory created: `/home/a1eksma/four-t-data`
- [x] Example data seeded into volume (`manifest.json` + 5 track files)
- [x] `docker compose up -d web` — container running on `127.0.0.1:8080`

### nginx on remote server
- [x] Site config created at `/etc/nginx/sites-available/a1exma.online`
- [x] Symlink created in `/etc/nginx/sites-enabled/`
- [x] HTTP serving confirmed (`200 OK` via proxy)
- [x] `certbot --nginx -d a1exma.online` — certificate issued (expires 2026-06-27)
- [x] `https://a1exma.online` → widget demo (`200 OK`)
- [x] `https://a1exma.online/wizard.html` → wizard (`200 OK`)
- [x] HTTP → HTTPS redirect confirmed (`301`)

### Local server cleanup
- [x] nginx config removed from `/etc/nginx/sites-enabled/` (local server)
- [x] nginx reloaded on local server

### GitHub Actions
- [x] `DEPLOY_SSH_KEY` secret set
- [x] `DEPLOY_HOST` secret set
- [x] `DEPLOY_USER` secret set
- [x] `.github/workflows/deploy.yml` committed and pushed
- [x] Pipeline runs successfully on push to `main` ✅

---

## Commits

| Commit | Description |
|--------|-------------|
| `cd29d4f` | feat(issue-8): add Docker, GitHub Actions, migrate to VPS — Stage 3 |
| `b5d1ab8` | fix(ci): pass vitest with no tests until Issue #7 is implemented |

---

## Implementation notes

**SSH sudo workaround:** `sudo -S` does not work over non-interactive SSH sessions on
this server. Remote `sudo` commands were executed via the `sigil` user with
`sshpass + ssh -tt`. The `a1eksma` user has Docker group access and does not need
`sudo` for container operations.

**DNS propagation:** A-record for `a1exma.online` updated at reg.ru
(`45.63.121.41` → `195.2.67.202`) on 2026-03-29. Propagation in progress.
The server responds correctly when accessed directly by IP.

**`--passWithNoTests`:** Added to the vitest command in `docker-compose.yml` to prevent
CI failures until Issue #7 (Testing Infrastructure) is implemented. Removed when
first tests are added.

---

## Verification

```
Container:    127.0.0.1:8080 → 200 OK
HTTPS direct: https://a1exma.online (via 195.2.67.202) → 200 OK
wizard.html:  https://a1exma.online/wizard.html → 200 OK
HTTP redirect: 301 → HTTPS
SSL cert:     /etc/letsencrypt/live/a1exma.online/fullchain.pem (expires 2026-06-27)
CI/CD:        GitHub Actions — test ✅ deploy ✅ (run #23711169675)
```
