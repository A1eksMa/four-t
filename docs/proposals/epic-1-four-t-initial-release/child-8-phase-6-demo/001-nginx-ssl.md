# Stage 1: nginx config + SSL + index.html live

**Issue:** #8
**Stage:** 001
**Status:** In Progress

---

## Goal

`https://a1exma.online` serves the four-t widget demo (`index.html` + full example data)
from the repository root, with a valid TLS certificate.

---

## Checklist

- [ ] nginx site config created at `/etc/nginx/sites-available/a1exma.online`
- [ ] Symlink created in `/etc/nginx/sites-enabled/`
- [ ] nginx reloaded — HTTP serving confirmed
- [ ] `certbot --nginx -d a1exma.online` — certificate issued
- [ ] nginx reloaded with HTTPS config
- [ ] `https://a1exma.online` responds with `index.html`
- [ ] Widget renders all 5 tracks in browser
- [ ] HTTP → HTTPS redirect confirmed

---

## nginx config

File: `/etc/nginx/sites-available/a1exma.online`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name a1exma.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name a1exma.online;

    root /home/a1eksma/github/four-t;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|json|css|html|svg|png|ico|woff2?)$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    access_log /var/log/nginx/a1exma.online_access.log;
    error_log  /var/log/nginx/a1exma.online_error.log;
}
```

SSL directives (`ssl_certificate`, `ssl_certificate_key`, `include`) are added
automatically by certbot.

---

## File permissions

nginx worker (`www-data`) needs read access to the repo path:

```bash
chmod o+x /home/a1eksma
chmod o+x /home/a1eksma/github
chmod o+x /home/a1eksma/github/four-t
# Files are already world-readable (default umask 022)
```

---

## Notes

- Certbot uses `--nginx` plugin: modifies the config in-place, no webroot files needed
- No files are created inside the git repository by this process
- Stage 2 (`002-wizard-route.md`) adds `/wizard` location after Phase 3 is complete
