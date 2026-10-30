## [2026-10-30]

### Proyecto: juego-taller

**Contexto:** Demostración en vivo para egresados Santo Tomás — ciclo completo (juego, GitHub, Coolify OVH, correo Resend).

**Cambios:**
- Scaffold Vite + TypeScript y endless runner Canvas `#feature`
- Tests Vitest (colisión, score, récord, engine) `#feature`
- Dockerfile nginx:1.27-alpine + dist versionado `#config`
- Proyecto/app Coolify OVH y dominio juego-taller.codepulse.cl `#config`

**Decisiones:**
- Build Node solo en local; imagen de producción copia `dist/` (evita fallo Node 22 Alpine en el servidor).
- Repo público `rinostrozacl/juego-taller`.

**Próximos pasos:**
- Verificar healthy + HTTP 200 y envío Resend.

**Archivos afectados:** `src/game/*`, `Dockerfile`, `nginx.conf`, `package.json`, `.agents/`
