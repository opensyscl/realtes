Quiero construir un clon de Tidio (tidio.com) — un SaaS de chat en vivo con widget embebible para sitios web.

Actúa como un arquitecto de software senior especializado en PHP/Symfony y AWS y dame el stack técnico completo para construirlo.

CONTEXTO:
- Es un clon funcional de Tidio: widget de chat que se instala en sitios de clientes, dashboard para que los agentes respondan en tiempo real
- Sistema nuevo, podemos usar versiones actuales estables
- Venimos de Symfony 3 + MariaDB + AWS, queremos modernizarnos sin salir del ecosistema PHP/Symfony
- Modelo multi-tenant: múltiples clientes, cada uno con su widget y sus agentes
- Chat en tiempo real entre visitantes y agentes
- Integración futura con CRM vía colas

BACKEND — define exactamente:

1. Lenguaje y versión exacta (PHP)
2. Framework y versión exacta (Symfony LTS)
3. Librerías principales con comandos composer exactos
4. Base de datos: MariaDB 11.4 LTS con configuración my.cnf completa para producción
5. Esquema SQL mínimo: tablas widgets, conversations, messages
6. Web server: Nginx 1.26 con config completa (security headers, gzip, fastcgi, health check)
7. Cache Redis 7: key patterns, TTLs y config YAML de Symfony
8. Colas SQS FIFO con Symfony Messenger: config YAML completa y casos de uso
9. Autenticación JWT (Lexik) para agentes + visitor_token HMAC para visitantes anónimos
10. Security.yaml completo con firewalls y access_control
11. Rate limiting con Redis en endpoints de login
12. CORS con nelmio/cors-bundle
13. Docker: Dockerfile multi-stage (PHP 8.3 + Nginx + Supervisor en un container), docker-compose.yaml para desarrollo local con MariaDB + Redis + Mercure
14. CI/CD con GitHub Actions: test → build imagen → migración DB → deploy ECS
15. Estructura de carpetas src/ completa (Controller/DTO/Entity/Service/Message/Security)

INFRAESTRUCTURA AWS — define exactamente:

16. Diagrama de arquitectura en texto ASCII: CloudFront → ALB → ECS Fargate (API + Mercure Hub separados) → RDS + ElastiCache + SQS + S3 + Secrets Manager
17. Configuración mínima de cada servicio (instance type, storage, Multi-AZ, etc.)
18. ECS Auto Scaling policy JSON (CPU 60% + requests/target)
19. RDS Proxy para pooling de conexiones
20. ALB routing rules para /api/* y /.well-known/mercure

FRONTEND — define exactamente (DOS proyectos separados):

PROYECTO 1 — Widget embebible (lo que se instala en el sitio del cliente, igual que el widget de Tidio):
21. Stack: Vanilla JS + TypeScript 5.5 + Web Components + Vite 6 (formato IIFE, <30KB gzip)
22. Por qué NO usar React para el widget (Shadow DOM, aislamiento, conflictos de versión)
23. vite.config.ts completo para build IIFE de un solo archivo
24. Web Component completo con Shadow DOM: bootstrap por data-widget-id, loadConfig(), startConversation(), subscribeMercure() con EventSource nativo, sendMessage(), appendMessage()
25. Visitor token: UUID en localStorage, sin JWT
26. Snippet de instalación de 1 línea para el cliente (igual que el snippet de Tidio)
27. Deploy a S3 con cache-control immutable

PROYECTO 2 — Dashboard de agentes (equivalente al panel de Tidio donde los agentes responden):
28. Stack: React 19 + TypeScript 5.5 + Vite 6 + React Router 7 + TanStack Query 5 + Zustand 5 + TanStack Table 8 + Radix UI + Tailwind CSS 4 + React Hook Form 7 + Zod 3 + Axios 1
29. Estructura de carpetas completa (api/, hooks/, store/, pages/, components/)
30. Axios client con interceptors JWT: inyección automática de Bearer token y auto-refresh en 401
31. Zustand store para auth con persist middleware (token + refreshToken + user)
32. Hook useMercure() que actualiza cache de TanStack Query directamente con setQueryData sin refetch
33. ChatPane.tsx completo: useQuery para historial, useMutation para envío, auto-scroll, formato de hora con date-fns
34. vite.config.ts con manualChunks para code splitting (react-vendor, query-vendor, ui-vendor, form-vendor)
35. Deploy SPA a S3: sync con immutable cache + index.html sin cache + invalidación CloudFront
36. GitHub Actions unificado para widget y dashboard con paths filter

CIERRE:
37. Tabla resumen de todas las versiones fijadas (backend + frontend)
38. Diagrama ASCII del flujo completo de datos: Visitante → Widget → API Symfony → MariaDB + Mercure Hub → Dashboard agente (SSE) → respuesta → Widget

REGLAS:
- Versiones exactas en todo, sin rangos vagos
- Código real y funcional, no pseudocódigo
- Configuraciones listas para copiar y pegar en producción
- Todo orientado a un SaaS multi-tenant de chat en vivo, no a un proyecto genérico