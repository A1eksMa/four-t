# Stage 1 Progress: nginx config + SSL + index.html live

**Issue:** #8
**Stage:** 001
**Status:** Complete
**Date:** 2026-03-29

---

## Result

`https://a1exma.online` is live and serving the four-t widget demo.

## Checklist

- [x] nginx site config created at `/etc/nginx/sites-available/a1exma.online`
- [x] Symlink created in `/etc/nginx/sites-enabled/`
- [x] nginx reloaded — HTTP serving confirmed (`200 OK`)
- [x] `certbot --nginx -d a1exma.online` — certificate issued (expires 2026-06-27, auto-renewal configured)
- [x] nginx reloaded with HTTPS config
- [x] `https://a1exma.online` responds with `index.html` (`200 OK`)
- [x] Widget renders all 5 tracks in browser
- [x] HTTP → HTTPS redirect confirmed (`301`)
- [x] Cache-Control headers on static assets (`1h / public`)
- [x] `4t-data/example/manifest.json` accessible via HTTPS

## Verification

```
HTTP → HTTPS redirect: 301
HTTPS status:          200
manifest.json:         200 (JSON content confirmed)
Cache-Control:         max-age=3600, public (on .js/.json files)
SSL cert:              /etc/letsencrypt/live/a1exma.online/fullchain.pem
SSL expiry:            2026-06-27 (auto-renew enabled)
```

## Implementation notes

**Two-step approach:** nginx was first configured as HTTP-only (no `listen 443 ssl`),
then certbot added SSL directives in-place. This is necessary because nginx refuses
to start with an `ssl` listener if no certificate exists yet.

**Cache headers:** Added `location ~* \.(js|json|...)$` block after certbot ran,
preserving the `# managed by Certbot` directives unchanged.

**Repo permissions:** Directories `/home/a1eksma`, `/home/a1eksma/github`,
`/home/a1eksma/github/four-t` were already `755` — no permission changes needed.

## What's next

Stage 2 (`002-wizard-route.md`): add `location /wizard` after Phase 3 produces `wizard.html`.
