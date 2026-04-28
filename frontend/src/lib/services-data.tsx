import {
  Home05Icon,
  KanbanIcon,
  WhatsappIcon,
  InvoiceIcon,
  ChartBarLineIcon,
  Camera01Icon,
  Location01Icon,
  FilePinIcon,
  MegaphoneIcon,
  QrCodeIcon,
  ChartLineData01Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  ArrowUpRight01Icon,
  CreditCardIcon,
  Mail01Icon,
  BellDotIcon,
  Clock01Icon,
  InstagramIcon,
  MessengerIcon,
  Globe02Icon,
  AlertCircleIcon,
  DollarCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface Service {
  slug: string;
  icon: IconSvgElement;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  features: { icon: IconSvgElement; title: string; text: string }[];
  steps: { num: string; title: string; text: string }[];
  before: string[];
  after: string[];
  stats: { value: string; label: string; sub?: string }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    agency: string;
    avatar: string;
    metric: { value: string; label: string };
  };
  faqs: { q: string; a: string }[];
}

export const SERVICES: Record<string, Service> = {
  cartera: {
    slug: "cartera",
    icon: Home05Icon,
    eyebrow: "Cartera de propiedades",
    title: "Tu cartera, perfectamente",
    titleAccent: "ordenada",
    subtitle:
      "Captación, ficha completa, fotos, documentos, mapa y publicación. Tu inventario por fin centralizado, sin pestañas extras.",
    metaTitle: "Cartera de propiedades — gestión completa para tu corredora",
    metaDescription:
      "Gestiona tu cartera de propiedades con Realtes: ficha completa con 50+ campos, galería con tour 360°, mapa con pins de precio, watermark automático, documentos y publicación a portales. Tu inventario en orden.",
    metaKeywords: [
      "gestión propiedades inmobiliaria",
      "ficha propiedad CRM",
      "tour 360 propiedades",
      "mapa propiedades inmobiliarias",
      "watermark fotos propiedades",
      "publicación portales inmobiliarios Chile",
    ],
    features: [
      {
        icon: FilePinIcon,
        title: "Ficha con 50+ campos",
        text: "Interior, exterior, edificio, deudas, equipamiento. Todo lo que un comprador o arrendatario quiere saber.",
      },
      {
        icon: Camera01Icon,
        title: "Galería + tour 360°",
        text: "Fotos con cover automática, drag & drop para reordenar, tour 360 y vídeo embebido.",
      },
      {
        icon: Location01Icon,
        title: "Mapa con pins de precio",
        text: "Geolocaliza cada propiedad y visualiza tu cartera en un mapa interactivo.",
      },
      {
        icon: QrCodeIcon,
        title: "QR para folletería",
        text: "Genera QR de cada propiedad para vitrinas, folletos físicos y stories.",
      },
      {
        icon: AlertCircleIcon,
        title: "Estados claros",
        text: "Disponible, reservado, vendido, arrendado. Cambios reflejados al instante en tu escaparate.",
      },
      {
        icon: MegaphoneIcon,
        title: "Watermark automático",
        text: "Cada foto subida lleva tu marca, configurable (posición, opacidad, tamaño).",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Captas y subes",
        text: "Crea la ficha completa, arrastra fotos y documentos, geolocaliza en el mapa.",
      },
      {
        num: "02",
        title: "Publicas",
        text: "Activa la propiedad en tu escaparate público y feeds de Portal Inmobiliario y Toctoc.",
      },
      {
        num: "03",
        title: "Cierras",
        text: "Cuando hay oferta, marca como reservada o vendida. Todo se sincroniza solo.",
      },
    ],
    before: [
      "Excel con 30 columnas que nadie entiende",
      "Fotos perdidas en WhatsApp",
      "Sin watermark, fotos robadas en redes",
      "Tienes que actualizar 4 portales a mano",
    ],
    after: [
      "Ficha rica con 50+ campos auto-validados",
      "Galería ordenada con cover y tour 360",
      "Watermark aplicado al subir, automático",
      "Publica una vez, sincroniza con todos los portales",
    ],
    stats: [
      { value: "50+", label: "campos por ficha", sub: "interior · exterior · edificio" },
      { value: "3 min", label: "para publicar", sub: "vs 25 min en Excel" },
      { value: "0", label: "errores de tipeo", sub: "validación automática" },
    ],
    testimonial: {
      quote:
        "Pasamos de tener fotos en WhatsApp y fichas en Excel a un sistema donde todo está bonito y se publica solo a Portal Inmobiliario.",
      author: "Lucía Romero",
      role: "Head of Captación",
      agency: "Marina Living",
      avatar: "https://i.pravatar.cc/120?img=20",
      metric: { value: "3×", label: "captaciones publicadas / mes" },
    },
    faqs: [
      {
        q: "¿Puedo importar mi cartera actual desde Excel?",
        a: "Sí. En el plan Pro y Business hacemos la migración inicial. Mándanos tu Excel y en 48-72h tienes todas las propiedades dentro con sus fotos, ubicación y estado.",
      },
      {
        q: "¿El tour 360° tiene costo extra?",
        a: "No. Está incluido desde el plan Pro. Subes el archivo .jpg equirectangular o el iframe de Matterport y queda embebido en la ficha pública.",
      },
      {
        q: "¿Cómo funciona el watermark automático?",
        a: "Configuras tu logo y la posición una sola vez. Cada foto que subas (vía web o móvil) sale con la marca aplicada. Si después cambias el logo, puedes regenerar todas las fotos en bulk.",
      },
    ],
  },
  crm: {
    slug: "crm",
    icon: KanbanIcon,
    eyebrow: "CRM con pipeline kanban",
    title: "Cada lead, un cierre",
    titleAccent: "potencial",
    subtitle:
      "Pipeline visual, actividades, recordatorios. Desde el primer contacto hasta la firma del contrato — sin perder nada por el camino.",
    metaTitle: "CRM kanban inmobiliario — pipeline visual de leads y oportunidades",
    metaDescription:
      "CRM con pipeline kanban configurable, actividades, recordatorios automáticos y conversión 1-click de lead a contrato. Tracking de origen para medir ROI por canal. Sube tu conversión sin contratar más agentes.",
    metaKeywords: [
      "CRM inmobiliario kanban",
      "pipeline ventas inmobiliaria",
      "CRM corredora propiedades Chile",
      "leads inmobiliarios scoring",
      "conversión lead contrato",
    ],
    features: [
      {
        icon: KanbanIcon,
        title: "Pipeline kanban configurable",
        text: "Etapas a medida por proyecto: prospecto, visita, oferta, cierre. Reordena con drag & drop.",
      },
      {
        icon: Calendar03Icon,
        title: "Actividades y agenda",
        text: "Llamadas, emails, reuniones, tareas. Todo unificado en la timeline del lead.",
      },
      {
        icon: BellDotIcon,
        title: "Recordatorios automáticos",
        text: "Avisos antes de visitas, vencimientos de oferta y follow-ups que se agendan solos.",
      },
      {
        icon: ArrowUpRight01Icon,
        title: "Conversión 1-click",
        text: "De lead a contrato + cargo + comisión en un click. Sin re-tipear datos.",
      },
      {
        icon: ChartLineData01Icon,
        title: "Tracking de origen",
        text: "Sabe de dónde vino cada lead: Instagram, Portal, referido, escaparate. Mide ROI por canal.",
      },
      {
        icon: UserMultiple02Icon,
        title: "Asignación por agente",
        text: "Reparte leads automáticamente por reglas o manualmente. Cada agente ve solo los suyos.",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Entra el lead",
        text: "Captas por WhatsApp, Instagram, formulario web o lo creas manualmente.",
      },
      {
        num: "02",
        title: "Mueves la card",
        text: "Avanza por las etapas del kanban a medida que califica, visita y negocia.",
      },
      {
        num: "03",
        title: "Cierras",
        text: "1 click para convertir el lead en contrato firmado y cargo activo.",
      },
    ],
    before: [
      "Leads anotados en cuaderno o post-it",
      "Sin priorización, todos parecen iguales",
      "Olvidas hacer follow-up, leads se enfrían",
      "Imposible medir conversión real",
    ],
    after: [
      "Cada lead con timeline completa de interacciones",
      "Etapas claras y probabilidad por estado",
      "Recordatorios automáticos antes de fechas",
      "Reportes de conversión por agente y origen",
    ],
    stats: [
      { value: "2.4×", label: "más conversión", sub: "vs gestión manual" },
      { value: "8h", label: "ahorradas por semana", sub: "automatizando follow-ups" },
      { value: "0", label: "leads perdidos", sub: "por olvido del agente" },
    ],
    testimonial: {
      quote:
        "Ver el pipeline en kanban hizo que cada agente supiera qué tocar primero. Subimos conversión sin contratar a nadie.",
      author: "Lucía Romero",
      role: "Head of Sales",
      agency: "Marina Living",
      avatar: "https://i.pravatar.cc/120?img=20",
      metric: { value: "2.4×", label: "conversión vs antes" },
    },
    faqs: [
      {
        q: "¿Cuántos pipelines puedo crear?",
        a: "El plan Pro permite 3 pipelines. Útil si manejas arriendo y venta por separado, o si tienes proyectos con flujos distintos. Business permite ilimitados.",
      },
      {
        q: "¿Puedo personalizar las etapas?",
        a: "Sí. Cada pipeline tiene sus propias etapas con nombre, color y porcentaje de probabilidad. Reordena con drag & drop, marca etapas como 'ganada' o 'perdida'.",
      },
      {
        q: "¿Hay scoring automático de leads?",
        a: "Por ahora no automático con IA, pero puedes configurar reglas: tags por origen, asignación automática por agente y prioridad manual. Scoring con IA está en roadmap Q3 2026.",
      },
    ],
  },
  captacion: {
    slug: "captacion",
    icon: WhatsappIcon,
    eyebrow: "Captación multicanal",
    title: "Tus leads ya están",
    titleAccent: "en redes",
    subtitle:
      "WhatsApp Business, Instagram DM y Facebook Messenger conectados a una bandeja unificada. Ningún mensaje se pierde, ningún lead se enfría.",
    metaTitle:
      "Captación multicanal — WhatsApp, Instagram y Messenger en una bandeja",
    metaDescription:
      "Recibe leads de WhatsApp Business, Instagram DM y Facebook Messenger en una sola bandeja unificada. Auto-asignación al agente, plantillas, lead creado automáticamente en el CRM. Para corredoras de propiedades en Chile.",
    metaKeywords: [
      "WhatsApp Business inmobiliario",
      "Instagram leads inmobiliarios Chile",
      "Messenger inmobiliario",
      "captación multicanal corredora",
      "bandeja unificada inmobiliaria",
    ],
    features: [
      {
        icon: WhatsappIcon,
        title: "WhatsApp Business",
        text: "Recibe mensajes directos en tu inbox. Plantillas y respuestas rápidas configurables.",
      },
      {
        icon: InstagramIcon,
        title: "Instagram DM",
        text: "Captación desde reels, stories y bio. Cada DM se convierte en lead automáticamente.",
      },
      {
        icon: MessengerIcon,
        title: "Facebook Messenger",
        text: "Conversaciones desde tu fanpage centralizadas en la misma bandeja.",
      },
      {
        icon: UserMultiple02Icon,
        title: "Auto-asignación",
        text: "Reglas por horario, ubicación o tipo de propiedad. El lead llega al agente correcto.",
      },
      {
        icon: Mail01Icon,
        title: "Plantillas y respuestas rápidas",
        text: "Saludo, agenda de visita, pedir RUT — un click y enviado.",
      },
      {
        icon: ArrowUpRight01Icon,
        title: "Lead creado al instante",
        text: "Cada conversación nueva se materializa como lead en el CRM con su origen tracked.",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Conectas tus canales",
        text: "Vincula WhatsApp Business, Instagram y Messenger desde Ajustes en 5 minutos.",
      },
      {
        num: "02",
        title: "Mensajes llegan a Realtes",
        text: "Todos los mensajes entran a tu bandeja unificada en tiempo real.",
      },
      {
        num: "03",
        title: "Tu equipo responde",
        text: "Cada agente ve sus conversaciones, responde con plantillas y convierte a lead.",
      },
    ],
    before: [
      "Mensajes en 3 apps distintas — alguien siempre olvida una",
      "Capturas de pantalla pegadas en grupos de WhatsApp",
      "Imposible saber quién está atendiendo qué",
      "Lead que escribió por Instagram, perdido en DMs",
    ],
    after: [
      "Una sola bandeja con todos los canales",
      "Asignación automática al agente correcto",
      "Estado claro: nuevo · respondido · convertido",
      "Cada conversación → lead en el CRM con origen",
    ],
    stats: [
      { value: "+128", label: "leads/mes", sub: "promedio por canal de WhatsApp" },
      { value: "<2 min", label: "tiempo de respuesta", sub: "vs 45 min sin bandeja" },
      { value: "100%", label: "captura de leads", sub: "ningún mensaje se pierde" },
    ],
    testimonial: {
      quote:
        "Antes los leads de Instagram se nos perdían entre los DMs. Ahora cada mensaje aparece en la bandeja con foto, ubicación de la propiedad y asignado a un agente.",
      author: "Carla Montoya",
      role: "CEO",
      agency: "Montoya Propiedades",
      avatar: "https://i.pravatar.cc/120?img=47",
      metric: { value: "+38%", label: "leads / trimestre" },
    },
    faqs: [
      {
        q: "¿Necesito una cuenta de WhatsApp Business?",
        a: "Sí. WhatsApp Business es gratis y se descarga en cualquier teléfono. Realtes se conecta con tu cuenta existente vía la API oficial de Meta.",
      },
      {
        q: "¿Puedo seguir respondiendo desde mi teléfono también?",
        a: "Sí. Los mensajes que envías desde el celular también se sincronizan en Realtes — el cliente no nota diferencia, tu equipo sí.",
      },
      {
        q: "¿Cuántos canales puedo conectar?",
        a: "Ilimitados. Si tienes varias cuentas de WhatsApp (por oficina, por agente, por proyecto) las conectas todas a la misma bandeja con etiquetas.",
      },
    ],
  },
  cobros: {
    slug: "cobros",
    icon: InvoiceIcon,
    eyebrow: "Contratos & cobros",
    title: "Cargos, pagos, comisiones —",
    titleAccent: "sin Excel",
    subtitle:
      "Generación automática de cargos mensuales, control de mora, reajuste IPC/UF y splits de comisión multi-agente. Tu administradora está en el sistema, no en hojas de cálculo.",
    metaTitle:
      "Cargos automáticos, comisiones y cobranza — administración inmobiliaria sin Excel",
    metaDescription:
      "Genera cargos mensuales automáticos en CLP o UF, controla mora con aging, aplica reajuste IPC/UF, calcula splits de comisión multi-agente y concilia pagos uno-a-muchos. Para corredoras de propiedades en Chile.",
    metaKeywords: [
      "cargos arriendo automáticos",
      "comisiones inmobiliarias splits",
      "cobranza arriendo Chile",
      "reajuste UF arriendo",
      "aging cuentas por cobrar inmobiliaria",
      "conciliación pagos arriendo",
    ],
    features: [
      {
        icon: FilePinIcon,
        title: "Plantillas de contrato",
        text: "Crea tus modelos una vez, genera PDFs con datos del arriendo y arrendatario al instante.",
      },
      {
        icon: Calendar03Icon,
        title: "Cargos mensuales automáticos",
        text: "Define el día del mes y la plataforma genera cargos sin intervención.",
      },
      {
        icon: ChartLineData01Icon,
        title: "Reajuste IPC/UF",
        text: "El sistema aplica el reajuste según fecha y % configurado. Cero matemáticas a mano.",
      },
      {
        icon: AlertCircleIcon,
        title: "Aging y mora",
        text: "Reportes con días de atraso, intereses calculados y avisos automáticos al arrendatario.",
      },
      {
        icon: CreditCardIcon,
        title: "Conciliación uno-a-muchos",
        text: "Un pago bancario puede saldar varios cargos. Asignación automática por monto.",
      },
      {
        icon: DollarCircleIcon,
        title: "Splits multi-agente",
        text: "Comisión repartida entre captador, vendedor y oficina. Reglas por % o monto fijo.",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Generas el contrato",
        text: "Plantilla + datos del arriendo → PDF firmado y guardado en la propiedad.",
      },
      {
        num: "02",
        title: "Realtes genera los cargos",
        text: "Cada mes, el día configurado, los cargos aparecen como pendientes con su valor.",
      },
      {
        num: "03",
        title: "Concilias pagos",
        text: "Sube la cartola del banco, Realtes asigna pagos a cargos automáticamente.",
      },
    ],
    before: [
      "Excel mensual con fórmulas que se rompen",
      "Reajuste IPC calculado a mano cada año",
      "Llamas al arrendatario para avisar la mora",
      "Comisiones repartidas en una hoja aparte",
    ],
    after: [
      "Cargos auto-generados el día que tú elijas",
      "Reajuste IPC/UF aplicado automáticamente",
      "Avisos de mora enviados por email al arrendatario",
      "Splits calculados por la plataforma, sin error",
    ],
    stats: [
      { value: "2 días", label: "ahorrados al mes", sub: "vs generación manual" },
      { value: "0%", label: "errores de cálculo", sub: "todo validado por sistema" },
      { value: "100%", label: "pagos conciliados", sub: "asignación automática" },
    ],
    testimonial: {
      quote:
        "La generación automática de cargos nos ahorra dos días de trabajo cada mes. Nadie quiere volver atrás.",
      author: "David Ferrer",
      role: "Director",
      agency: "Ferrer Propiedades",
      avatar: "https://i.pravatar.cc/120?img=33",
      metric: { value: "8h", label: "ahorradas por semana" },
    },
    faqs: [
      {
        q: "¿Soporta arriendos en UF?",
        a: "Sí. Defines el valor del arriendo en UF y Realtes calcula el monto en CLP a la fecha de cada cargo usando la UF oficial. El reporte mensual te muestra ambas cifras.",
      },
      {
        q: "¿Cómo funciona la conciliación bancaria?",
        a: "Subes la cartola del banco (CSV o Excel) y la plataforma matchea pagos con cargos pendientes por monto y arrendatario. Los matches dudosos quedan para revisión manual.",
      },
      {
        q: "¿Puedo manejar splits con porcentajes distintos por contrato?",
        a: "Sí. Cada contrato puede tener su propia regla de comisión: % fijo, monto fijo o split entre múltiples agentes con porcentajes distintos. Configurable por tipo de operación (venta/arriendo).",
      },
    ],
  },
  reportes: {
    slug: "reportes",
    icon: ChartBarLineIcon,
    eyebrow: "Reportes & analytics",
    title: "Decide con datos, no",
    titleAccent: "con sensaciones",
    subtitle:
      "Dashboards limpios: morosidad, aging, ingresos por propiedad, performance por agente. Siempre al día, exportables, accionables.",
    metaTitle: "Reportes inmobiliarios — KPIs en tiempo real para tu corredora",
    metaDescription:
      "Dashboards limpios con morosidad, aging, ingresos por propiedad, performance por agente y conversión de pipeline. Datos en tiempo real, exportables a Excel. Decide con números, no con corazonadas.",
    metaKeywords: [
      "reportes inmobiliarios",
      "KPIs corredora propiedades",
      "dashboard morosidad arriendo",
      "performance agente inmobiliario",
      "analytics inmobiliario Chile",
    ],
    features: [
      {
        icon: ChartBarLineIcon,
        title: "Dashboard de operaciones",
        text: "KPIs principales en una sola pantalla: ingresos, leads activos, propiedades disponibles, mora.",
      },
      {
        icon: DollarCircleIcon,
        title: "Reporte financiero mensual",
        text: "Ingresos por propiedad, por oficina, por tipo de operación. Comparativa mes vs mes.",
      },
      {
        icon: AlertCircleIcon,
        title: "Aging de cuentas por cobrar",
        text: "Mora segmentada por antigüedad: 0-30, 31-60, 61-90, 90+ días. Acción inmediata.",
      },
      {
        icon: UserMultiple02Icon,
        title: "Performance por agente",
        text: "Conversión, tiempo promedio de cierre, leads atendidos, comisión generada.",
      },
      {
        icon: ChartLineData01Icon,
        title: "Conversión de pipeline",
        text: "Tasa de conversión por etapa. Identifica el cuello de botella en tu funnel.",
      },
      {
        icon: Globe02Icon,
        title: "Exportación a Excel",
        text: "Cualquier reporte, cualquier rango de fechas, descargado en .xlsx para tu contadora.",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Tus datos entran",
        text: "Cada acción del equipo (lead, visita, contrato, pago) alimenta los reportes.",
      },
      {
        num: "02",
        title: "Realtes calcula",
        text: "KPIs y agregaciones se actualizan en tiempo real. Sin batches nocturnos.",
      },
      {
        num: "03",
        title: "Tomas decisión",
        text: "Identificas qué propiedad rinde más, qué agente convierte mejor, qué mes flojo.",
      },
    ],
    before: [
      "Excel a fin de mes que toma 4 horas armar",
      "Datos desactualizados al momento de leerlos",
      "Imposible comparar agentes objetivamente",
      "No sabes en cuál etapa pierdes leads",
    ],
    after: [
      "Dashboard listo, accesible 24/7",
      "Datos en tiempo real, sin lag",
      "Ranking de agentes con métricas claras",
      "Funnel visible con drop-off por etapa",
    ],
    stats: [
      { value: "Real-time", label: "actualización", sub: "sin batches nocturnos" },
      { value: "4h → 0", label: "tiempo de armado mensual", sub: "ya no armas, lees" },
      { value: "12+", label: "reportes pre-armados", sub: "más exportación libre" },
    ],
    testimonial: {
      quote:
        "Antes esperábamos al día 5 del mes para ver cuánto facturamos. Ahora lo veo en cualquier momento desde mi celular.",
      author: "Carla Montoya",
      role: "CEO",
      agency: "Montoya Propiedades",
      avatar: "https://i.pravatar.cc/120?img=47",
      metric: { value: "+38%", label: "operaciones / trimestre" },
    },
    faqs: [
      {
        q: "¿Puedo crear reportes personalizados?",
        a: "El plan Pro incluye los 12+ reportes pre-armados. El plan Business permite reportes a medida y acceso a la API para conectar con Looker, PowerBI o Metabase.",
      },
      {
        q: "¿Los reportes incluyen datos históricos?",
        a: "Sí. Cualquier rango de fechas, desde la creación de tu cuenta. Histórico ilimitado en plan Pro y Business.",
      },
      {
        q: "¿Puedo automatizar envío de reportes por email?",
        a: "Sí. Configuras un reporte recurrente (mensual, semanal) con destinatarios y se envía solo en PDF o Excel.",
      },
    ],
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICES);

export function getService(slug: string): Service | undefined {
  return SERVICES[slug];
}

/* Helpers de iconos exportados para uso en otros componentes */
export const SERVICE_ICONS: Record<string, IconSvgElement> = {
  cartera: Home05Icon,
  crm: KanbanIcon,
  captacion: WhatsappIcon,
  cobros: InvoiceIcon,
  reportes: ChartBarLineIcon,
};

export const CHECK_ICON = CheckmarkCircle02Icon;
export const CLOCK_ICON = Clock01Icon;
