# Stage 3: Docker, remote server, nginx proxy, SSL, GitHub Actions

**Issue:** #8
**Stage:** 003
**Status:** Ready

---

## Goal

Migrate the live service from the local server to `195.2.67.202`, running inside a
Docker container behind an nginx reverse proxy, with automated deploy via GitHub Actions.

---

## Checklist

### Remote server setup
- [ ] Repository cloned to `/home/a1eksma/github/four-t`
- [ ] Data volume directory created: `/home/a1eksma/four-t-data`
- [ ] Example data seeded into volume
- [ ] `docker compose up -d web` — container running on `127.0.0.1:8080`

### nginx on remote server
- [ ] Site config created at `/etc/nginx/sites-available/a1exma.online`
- [ ] Symlink created in `/etc/nginx/sites-enabled/`
- [ ] HTTP serving confirmed (`200 OK` via proxy)
- [ ] `certbot --nginx -d a1exma.online` — certificate issued
- [ ] `https://a1exma.online` → widget demo (`200 OK`)
- [ ] `https://a1exma.online/wizard.html` → wizard (`200 OK`)
- [ ] HTTP → HTTPS redirect confirmed (`301`)

### Local server cleanup
- [ ] nginx config removed from `/etc/nginx/sites-enabled/` (local)
- [ ] nginx reloaded on local server

### GitHub Actions
- [ ] `DEPLOY_SSH_KEY` secret set
- [ ] `DEPLOY_HOST` secret set
- [ ] `DEPLOY_USER` secret set
- [ ] `.github/workflows/deploy.yml` committed and pushed
- [ ] Pipeline runs successfully on push to `main`

---

## Docker setup

### `Dockerfile`

```dockerfile
FROM nginx:alpine
COPY nginx-container.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
```

The repository is bind-mounted at runtime — no COPY of source files into the image.
This allows `git pull` deploys without rebuilding the image.

### `docker-compose.yml`

```yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - .:/usr/share/nginx/html:ro
      - /home/a1eksma/four-t-data:/usr/share/nginx/html/4t-data
    restart: unless-stopped

  test:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - .:/app:ro
    command: npx vitest run
    profiles:
      - test
```

### `nginx-container.conf`

```nginx
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|json|css|html|svg|png|ico|woff2?)$ {
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

---

## Data volume setup (first deploy)

```bash
mkdir -p /home/a1eksma/four-t-data
cp -r /home/a1eksma/github/four-t/4t-data/example/* /home/a1eksma/four-t-data/
```

---

## nginx reverse proxy on remote server

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

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/a1exma.online_access.log;
    error_log  /var/log/nginx/a1exma.online_error.log;
}
```

SSL directives added automatically by certbot.

---

## GitHub Actions workflow

File: `.github/workflows/deploy.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: docker compose --profile test run --rm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /home/a1eksma/github/four-t
            git pull origin main
            docker compose up -d --force-recreate web
```

---

## Local server cleanup

```bash
sudo rm /etc/nginx/sites-enabled/a1exma.online
sudo nginx -s reload
```
