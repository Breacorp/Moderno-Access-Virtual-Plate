# VIRTUAL_PLATE_PHASE9_2_SECURITY_IMPLEMENTATION.md

- **Archivo modificado**: `server.js`
- **Cambio**: Eliminado el fallback `|| 'admin'` para `BOARD_USER` y `BOARD_PASS`. Si faltan las variables de entorno, responde `503 Virtual plate credentials not configured` sin iniciar con credenciales predeterminadas.

