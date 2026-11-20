# VIRTUAL_PLATE_PHASE9_AUDIT.md

- **Repositorio**: `Breacorp/Moderno-Access-Virtual-Plate` (Express + Node.js en Vercel).
- **Estado actual**: Basic Auth (`BOARD_USER` / `BOARD_PASS` con fallback `admin`), `if.cgi` (`go_log_page`, `go_user_page`, `want_emp`) y `man.cgi` (`want_door`) devolviendo `302 Found` a vistas `.htm`.
- **Pendiente**: Validación estricta de `status.cgi?type=config`, persistencia serverless externa y cobertura completa de `CmdBar.htm`.

