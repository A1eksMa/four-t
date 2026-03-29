# Stage 2: /wizard route

**Issue:** #8
**Stage:** 002
**Status:** Ready — Issue #5 complete, covered by Stage 3 deployment

---

## Goal

`https://a1exma.online/wizard.html` serves `4t-wizard/wizard.html` from the container.

---

## Note

The `/wizard.html` route is served automatically by the Docker container (nginx:alpine
with `try_files $uri $uri/`). No separate nginx location block is required — the file
exists at the correct path in the repository and is accessible via the container webroot.

This stage is delivered as part of Stage 3 (containerization). No standalone
implementation step needed.
