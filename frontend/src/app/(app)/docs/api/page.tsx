"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  CodeIcon,
  ArrowLeft01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "intro", label: "Introducción" },
  { id: "auth", label: "Autenticación" },
  { id: "tokens", label: "Tokens API" },
  { id: "properties", label: "Propiedades" },
  { id: "leads", label: "Leads (CRM)" },
  { id: "pipelines", label: "Pipelines y Stages" },
  { id: "contracts", label: "Contratos" },
  { id: "persons", label: "Personas" },
  { id: "charges", label: "Cargos y Pagos" },
  { id: "public", label: "Escaparate público" },
  { id: "errors", label: "Errores y rate limits" },
];

export default function ApiDocsPage() {
  const agency = useAuthStore((s) => s.user?.agency);
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:58000";
  const slug = agency?.slug ?? "tu-agencia";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <Link
        href="/ajustes"
        className="inline-flex items-center gap-1.5 text-xs text-foreground-muted transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft01Icon} size={13} /> Ajustes
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon={CodeIcon} size={13} />
            Documentación
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            API Reference
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
            Todos los endpoints disponibles para integrar Realtes con otras
            aplicaciones, scripts o servicios. Las respuestas son JSON; las
            peticiones autenticadas requieren un Bearer token.
          </p>
        </div>
        <a
          href={`${apiBase}/api/auth/me`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-muted"
        >
          <Icon icon={Globe02Icon} size={12} />
          {apiBase}
        </a>
      </div>

      <div className="mt-8 grid grid-cols-[200px_1fr] gap-8">
        {/* Sidebar nav */}
        <nav className="sticky top-6 self-start text-sm">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-xl px-3 py-1.5 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <article className="space-y-12">
          <Section id="intro" title="Introducción">
            <p>
              Toda petición a la API debe incluir los headers:
            </p>
            <Code language="http">{`Authorization: Bearer <TU_TOKEN>
Accept: application/json`}</Code>
            <p>
              La base URL es{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[12px]">
                {apiBase}/api
              </code>
              . Toda respuesta es JSON. Los recursos están scoped a tu agencia
              automáticamente — solo verás datos de{" "}
              <strong>{agency?.name ?? "tu agencia"}</strong>.
            </p>
          </Section>

          <Section id="auth" title="Autenticación">
            <p>Para obtener un token con email y password:</p>
            <Code language="bash">{`curl -X POST ${apiBase}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"tu@email.com","password":"...","device_name":"mi-app"}'`}</Code>
            <p>
              Respuesta: <code>{`{ "token": "...", "user": {...} }`}</code>. Para
              integraciones recomendamos usar la sección{" "}
              <a href="#tokens" className="font-medium text-primary">
                Tokens API
              </a>{" "}
              (con scopes), no el login con password.
            </p>
            <Endpoint method="GET" path="/api/auth/me" desc="Tu identidad" />
            <Endpoint
              method="POST"
              path="/api/auth/logout"
              desc="Revoca el token usado"
            />
          </Section>

          <Section id="tokens" title="Tokens API">
            <p>
              Personal Access Tokens generados desde{" "}
              <Link
                href="/ajustes"
                className="font-medium text-primary underline"
              >
                Ajustes → API & Tokens
              </Link>
              . Ideal para integraciones, apps móviles, scripts de cron.
            </p>
            <Endpoint method="GET" path="/api/tokens" desc="Listar tus tokens" />
            <Endpoint
              method="POST"
              path="/api/tokens"
              desc="Crear (devuelve plain_text_token solo una vez)"
            />
            <Endpoint
              method="DELETE"
              path="/api/tokens/{id}"
              desc="Revocar"
            />
            <p>
              Scopes (abilities) disponibles:{" "}
              <code>properties:read</code>, <code>properties:write</code>,{" "}
              <code>leads:read</code>, <code>leads:write</code>,{" "}
              <code>contracts:read</code>, <code>persons:read</code>,{" "}
              <code>persons:write</code>, <code>*</code>.
            </p>
            <Code language="bash">{`# Crear un token con scopes específicos
curl -X POST ${apiBase}/api/tokens \\
  -H "Authorization: Bearer <SESSION_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"App móvil","abilities":["properties:read","leads:write"]}'`}</Code>
          </Section>

          <Section id="properties" title="Propiedades">
            <Endpoint
              method="GET"
              path="/api/properties"
              desc="Listar (filtros + paginación)"
            />
            <p>
              Filtros: <code>search</code>, <code>status</code>,{" "}
              <code>type</code>, <code>listing_type</code>, <code>city</code>,{" "}
              <code>min_price</code>, <code>max_price</code>,{" "}
              <code>bedrooms_min</code>, <code>page</code>,{" "}
              <code>per_page</code>, <code>sort</code>, <code>dir</code>.
            </p>
            <Code language="bash">{`curl -H "Authorization: Bearer <TOKEN>" \\
  "${apiBase}/api/properties?status=disponible&min_price=600&max_price=2000&page=1"`}</Code>
            <Endpoint method="GET" path="/api/properties/stats" desc="Stats agregadas" />
            <Endpoint method="GET" path="/api/properties/map" desc="Geo-points para mapa" />
            <Endpoint method="GET" path="/api/properties/{id}" desc="Una propiedad" />
            <Endpoint method="POST" path="/api/properties" desc="Crear" />
            <Code language="json">{`{
  "title": "Apartamento en Russafa",
  "type": "apartamento",
  "listing_type": "alquiler",
  "address": "Calle Cuba 12",
  "city": "Valencia",
  "bedrooms": 2,
  "bathrooms": 1,
  "area_sqm": 78,
  "price_rent": 1200,
  "is_published": true,
  "features": ["balcon", "ascensor"]
}`}</Code>
            <Endpoint method="PATCH" path="/api/properties/{id}" desc="Actualizar (todos los campos opcionales)" />
            <Endpoint method="DELETE" path="/api/properties/{id}" desc="Eliminar (soft delete)" />
            <Endpoint
              method="POST"
              path="/api/properties/bulk"
              desc="Operación masiva: publicar, despublicar, borrar, cambiar status"
            />
            <Endpoint
              method="POST"
              path="/api/properties/{id}/share"
              desc="Compartir en marketplace cross-broker"
            />
            <Endpoint
              method="GET"
              path="/api/properties/{id}/photos"
              desc="Galería"
            />
            <Endpoint
              method="POST"
              path="/api/properties/{id}/photos"
              desc="Subir foto (multipart, campo 'photo')"
            />
            <Endpoint
              method="GET"
              path="/api/properties/{id}/analytics"
              desc="Vistas, leads, conversión"
            />
          </Section>

          <Section id="leads" title="Leads (CRM)">
            <Endpoint
              method="GET"
              path="/api/leads?pipeline_id=1"
              desc="Board agrupado por stage"
            />
            <Endpoint method="POST" path="/api/leads" desc="Crear lead manual" />
            <Code language="json">{`{
  "title": "Interesado en piso en Russafa",
  "pipeline_id": 1,
  "stage_id": 1,
  "contact_name": "Juan",
  "contact_email": "juan@x.com",
  "property_id": 87,
  "source": "web",
  "value": 1200
}`}</Code>
            <Endpoint
              method="POST"
              path="/api/leads/{id}/move"
              desc="Mover en kanban (stage_id + position)"
            />
            <Endpoint
              method="POST"
              path="/api/leads/{id}/convert"
              desc="Convertir a contrato"
            />
            <Endpoint
              method="POST"
              path="/api/leads/{id}/convert-to-property"
              desc="Convertir lead de captación a propiedad"
            />
            <Endpoint
              method="GET"
              path="/api/leads/{id}/activities"
              desc="Historial de actividades"
            />
            <Endpoint
              method="POST"
              path="/api/leads/{id}/activities"
              desc="Añadir actividad (call, note, email, visit)"
            />
          </Section>

          <Section id="pipelines" title="Pipelines y Stages">
            <Endpoint method="GET" path="/api/pipelines" desc="Listar pipelines con stages anidados" />
            <Endpoint method="POST" path="/api/pipelines" desc="Crear pipeline + stages iniciales" />
            <Code language="json">{`{
  "name": "Captación residencial",
  "purpose": "captacion",
  "stages": [
    { "name": "Nuevo", "color": "neutral", "probability_pct": 10 },
    { "name": "Visita", "color": "info", "probability_pct": 50 },
    { "name": "Firmado", "color": "positive", "is_won": true }
  ]
}`}</Code>
            <Endpoint method="PATCH" path="/api/pipelines/{id}" desc="Actualizar pipeline" />
            <Endpoint method="DELETE" path="/api/pipelines/{id}" desc="Eliminar (debe estar vacío)" />
            <Endpoint method="POST" path="/api/pipelines/{id}/stages" desc="Crear stage" />
            <Endpoint method="POST" path="/api/pipelines/{id}/stages/reorder" desc="Reordenar stages" />
            <Endpoint method="PATCH" path="/api/stages/{id}" desc="Actualizar stage" />
            <Endpoint method="DELETE" path="/api/stages/{id}" desc="Eliminar stage" />
          </Section>

          <Section id="contracts" title="Contratos">
            <Endpoint method="GET" path="/api/contracts" desc="Listar (status, page)" />
            <Endpoint method="GET" path="/api/contracts/{id}" desc="Detalle" />
            <Endpoint method="POST" path="/api/contracts" desc="Crear" />
            <Code language="json">{`{
  "code": "C-2026-0001",
  "property_id": 87,
  "tenant_id": 12,
  "owner_id": 5,
  "start_date": "2026-05-01",
  "end_date": "2027-04-30",
  "monthly_rent": 1200,
  "deposit": 2400,
  "status": "vigente"
}`}</Code>
            <Endpoint method="PATCH" path="/api/contracts/{id}" desc="Actualizar" />
            <Endpoint method="DELETE" path="/api/contracts/{id}" desc="Eliminar" />
          </Section>

          <Section id="persons" title="Personas">
            <Endpoint method="GET" path="/api/persons?type=tenant" desc="Listar (con type filtro)" />
            <Endpoint method="POST" path="/api/persons" desc="Crear" />
            <Code language="json">{`{
  "first_name": "Juan",
  "last_name": "García",
  "email": "juan@x.com",
  "phone": "+34 600 000 000",
  "type": "tenant"
}`}</Code>
          </Section>

          <Section id="charges" title="Cargos y Pagos">
            <Endpoint method="GET" path="/api/charges" desc="Listar (status, due_before)" />
            <Endpoint method="GET" path="/api/charges/stats" desc="Stats: pendiente, vencido, cobrado" />
            <Endpoint
              method="POST"
              path="/api/charges/generate"
              desc="Generar mensualidad de los contratos vigentes"
            />
            <Endpoint method="POST" path="/api/payments" desc="Registrar pago" />
            <Code language="json">{`{
  "charge_id": 123,
  "amount": 1200,
  "method": "transferencia",
  "paid_at": "2026-04-26"
}`}</Code>
            <Endpoint method="DELETE" path="/api/payments/{id}" desc="Anular pago" />
          </Section>

          <Section id="public" title="Escaparate público (sin auth)">
            <p>
              Endpoints abiertos para mostrar el escaparate de tu agencia y
              capturar leads desde tu web. La agencia se identifica por{" "}
              <code>slug</code>:{" "}
              <code className="font-mono">{slug}</code>.
            </p>
            <Endpoint
              method="GET"
              path={`/api/public/${slug}`}
              desc="Info de la agencia + template config"
            />
            <Endpoint
              method="GET"
              path={`/api/public/${slug}/properties`}
              desc="Listing público (mismos filtros que /api/properties)"
            />
            <Endpoint
              method="GET"
              path={`/api/public/${slug}/properties/{id}`}
              desc="Detalle de propiedad publicada (con fotos y descripción completa)"
            />
            <Endpoint
              method="POST"
              path={`/api/public/${slug}/leads`}
              desc="Capturar lead desde formulario externo"
            />
            <Code language="bash">{`curl -X POST ${apiBase}/api/public/${slug}/leads \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Juan","email":"juan@x.com","property_id":87,"message":"Quiero verla"}'`}</Code>
            <p className="text-xs text-foreground-muted">
              Si el mismo email contacta sobre la misma propiedad en menos de
              24h, la API responde <code>deduped: true</code> y añade actividad
              al lead existente.
            </p>
          </Section>

          <Section id="errors" title="Errores y rate limits">
            <p>Códigos de respuesta:</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="py-2 font-semibold">Código</th>
                  <th className="py-2 font-semibold">Significado</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono">401</td>
                  <td className="py-2">Token ausente o inválido</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono">402</td>
                  <td className="py-2">
                    Límite de plan alcanzado. Devuelve <code>feature</code>,{" "}
                    <code>current</code>, <code>limit</code>.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono">403</td>
                  <td className="py-2">
                    Token sin la ability necesaria
                  </td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono">404</td>
                  <td className="py-2">No existe o no es de tu agencia</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono">422</td>
                  <td className="py-2">
                    Validación falló — <code>errors</code> por campo
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">429</td>
                  <td className="py-2">
                    Rate limit superado — <code>Retry-After</code> en header
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 className="mt-6 font-semibold">Rate limits</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="py-2 font-semibold">Endpoint</th>
                  <th className="py-2 font-semibold">Límite</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono text-xs">POST /api/auth/login</td>
                  <td className="py-2">6/min por IP</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono text-xs">
                    POST /api/auth/register
                  </td>
                  <td className="py-2">3 cada 10 min por IP</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-mono text-xs">
                    POST /api/public/&#123;slug&#125;/leads
                  </td>
                  <td className="py-2">5/min y 30/h por IP</td>
                </tr>
                <tr>
                  <td className="py-2 text-xs">Resto de endpoints</td>
                  <td className="py-2">Sin tope específico (sujeto al plan)</td>
                </tr>
              </tbody>
            </table>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 border-b border-border-subtle pb-2 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground-muted [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
        {children}
      </div>
    </section>
  );
}

function Endpoint({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc?: string;
}) {
  const tone = {
    GET: "bg-info-soft text-info",
    POST: "bg-positive-soft text-positive",
    PATCH: "bg-warning-soft text-warning",
    DELETE: "bg-negative-soft text-negative",
  }[method] ?? "bg-surface-muted text-foreground";

  return (
    <Card className="flex items-center gap-3 p-3">
      <span
        className={cn(
          "rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold uppercase",
          tone,
        )}
      >
        {method}
      </span>
      <code className="flex-1 font-mono text-[13px]">{path}</code>
      {desc && (
        <span className="hidden text-xs text-foreground-muted sm:block">
          {desc}
        </span>
      )}
    </Card>
  );
}

function Code({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] text-white/80">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/25"
        >
          <Icon
            icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
            size={11}
          />
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-2xl bg-neutral-800 p-4 pr-24 text-[12px] leading-relaxed text-neutral-100">
        {children}
      </pre>
    </div>
  );
}
