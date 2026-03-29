# Stage 2: /wizard route

**Issue:** #8
**Stage:** 002
**Status:** Planned — blocked on Issue #5 (Phase 3: 4t-wizard)

---

## Goal

`https://a1exma.online/wizard` serves `wizard.html` after Phase 3 produces it.

---

## Blocker

`wizard.html` does not exist yet. This stage is unblocked when Issue #5 is complete.

---

## Checklist

- [ ] `wizard.html` exists in repo root (deliverable of Issue #5)
- [ ] Add `location /wizard` block to nginx config
- [ ] Reload nginx
- [ ] `https://a1exma.online/wizard` responds with `wizard.html` (`200 OK`)
- [ ] Wizard loads and FourT preview renders

---

## nginx change

Add to the HTTPS server block in `/etc/nginx/sites-available/a1exma.online`:

```nginx
location = /wizard {
    try_files /wizard.html =404;
}
```

No other changes required — the file is already in the webroot (repo root).
