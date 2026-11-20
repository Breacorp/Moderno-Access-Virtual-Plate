# VIRTUAL_PLATE_PERSISTENCE_DESIGN.md

- En Vercel Serverless, el estado en memoria se reinicia entre cold starts.
- Diseño propuesto: Store JSON/KV aislado por entorno (desactivable en tests unitarios), sin compartir base de datos con Moderno Access.

