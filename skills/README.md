# Skills instaladas — Calenadarier

Skills del ecosistema [skills.sh](https://skills.sh/) instaladas para el agente OpenCode en este proyecto.

| Skill | Paquete | Installs | Descripción |
|-------|---------|----------|-------------|
| Supabase | `supabase/agent-skills@supabase` | 145.9K | Gestión completa de Supabase: Database, Auth, Edge Functions, Storage, Realtime, migraciones, RLS |
| Postgres Best Practices | `supabase/agent-skills@supabase-postgres-best-practices` | 259.9K | Optimización de PostgreSQL: queries, esquemas, configuraciones, buenas prácticas de Supabase |
| Deploy to Vercel | `vercel-labs/agent-skills@deploy-to-vercel` | 82.3K | Deploy, preview deployments, CI/CD, configuración de entorno en Vercel |
| Vercel React Best Practices | `vercel-labs/agent-skills@vercel-react-best-practices` | 514.8K | Optimización de React/Next.js: Server Components, data fetching, bundle, rendimiento |
| Improve Codebase Architecture | `mattpocock/skills@improve-codebase-architecture` | 348.5K | Escaneo de código para identificar oportunidades de mejora arquitectónica, genera reportes HTML visuales |
| Webapp Testing | `anthropics/skills@webapp-testing` | 106.8K | Testing de aplicaciones web con Playwright: tests de frontend, capturas de pantalla, logs del navegador |
| Find Skills | `find-skills` | — | Skill base para descubrir e instalar nuevas skills del ecosistema |

## Instalación global

Las skills están instaladas en `~/.agents/skills/` y también copiadas localmente en este directorio para el proyecto.

## Comandos útiles

```bash
npx skills list                    # Listar skills instaladas
npx skills check                   # Buscar actualizaciones
npx skills update                  # Actualizar skills
npx skills add <paquete> -g -y     # Instalar nueva skill
npx skills find <consulta>         # Buscar skills en el ecosistema
```
