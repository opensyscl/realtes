/**
 * Reseñas de corredoras chilenas. Pure data — sin componentes para que se
 * pueda pasar libremente entre Server y Client Components.
 */
export interface Review {
  quote: string;
  author: string;
  role: string;
  agency: string;
  location: string;
  avatar: string;
  rating: number;
  metric: { value: string; label: string };
  service: "cartera" | "crm" | "captacion" | "cobros" | "reportes";
}

export const REVIEWS: Review[] = [
  {
    quote:
      "Pasamos de 4 herramientas distintas a una sola. El equipo factura más y discute menos quién hizo qué.",
    author: "Carla Montoya",
    role: "CEO",
    agency: "Montoya Propiedades",
    location: "Las Condes, Santiago",
    avatar: "https://i.pravatar.cc/200?img=47",
    rating: 5,
    metric: { value: "+38%", label: "operaciones / trimestre" },
    service: "crm",
  },
  {
    quote:
      "La generación automática de cargos nos ahorra dos días de trabajo cada mes. Nadie quiere volver atrás.",
    author: "David Ferrer",
    role: "Director",
    agency: "Ferrer Propiedades",
    location: "Vitacura, Santiago",
    avatar: "https://i.pravatar.cc/200?img=33",
    rating: 5,
    metric: { value: "8h", label: "ahorradas por semana" },
    service: "cobros",
  },
  {
    quote:
      "Ver el pipeline en kanban hizo que cada agente supiera qué tocar primero. Subimos conversión sin contratar a nadie.",
    author: "Lucía Romero",
    role: "Head of Sales",
    agency: "Marina Living",
    location: "Reñaca, Viña del Mar",
    avatar: "https://i.pravatar.cc/200?img=20",
    rating: 5,
    metric: { value: "2.4×", label: "conversión vs antes" },
    service: "crm",
  },
  {
    quote:
      "Antes los leads de Instagram se perdían entre los DMs. Ahora cada mensaje aparece en la bandeja con foto y propiedad asignada.",
    author: "Andrés Vargas",
    role: "Corredor",
    agency: "Vargas Propiedades",
    location: "Reñaca, Viña del Mar",
    avatar: "https://i.pravatar.cc/200?img=12",
    rating: 5,
    metric: { value: "+128", label: "leads / mes desde redes" },
    service: "captacion",
  },
  {
    quote:
      "Subir una propiedad pasó de 25 minutos a 3. Las fotos salen con watermark, el tour 360 queda embebido y publica solo a Portal Inmobiliario.",
    author: "Patricia Soto",
    role: "CEO",
    agency: "Patio Bonito",
    location: "Lo Barnechea, Santiago",
    avatar: "https://i.pravatar.cc/200?img=44",
    rating: 5,
    metric: { value: "8×", label: "más rápido publicar" },
    service: "cartera",
  },
  {
    quote:
      "El reporte mensual antes lo armaba en Excel en 4 horas. Ahora lo abro y está. Tomo decisiones con datos del día, no del mes pasado.",
    author: "Felipe Iturriaga",
    role: "Socio",
    agency: "Iturriaga Inversiones",
    location: "Vitacura, Santiago",
    avatar: "https://i.pravatar.cc/200?img=8",
    rating: 5,
    metric: { value: "4h → 0", label: "tiempo de reportes" },
    service: "reportes",
  },
  {
    quote:
      "El reajuste UF se aplicaba mal cada año, perdíamos plata. Realtes lo calcula solo con el valor oficial. Cero llamadas a la contadora.",
    author: "María José Rojas",
    role: "Gerente",
    agency: "Costa Capital",
    location: "Concón, Viña del Mar",
    avatar: "https://i.pravatar.cc/200?img=36",
    rating: 5,
    metric: { value: "100%", label: "exactitud reajustes" },
    service: "cobros",
  },
  {
    quote:
      "Mi equipo de 6 agentes ya no me pregunta dónde está la ficha de tal departamento. Está en Realtes, con todo: fotos, contrato, pagos.",
    author: "Cristián Núñez",
    role: "Founder",
    agency: "Núñez & Asociados",
    location: "Providencia, Santiago",
    avatar: "https://i.pravatar.cc/200?img=51",
    rating: 5,
    metric: { value: "0", label: "preguntas sobre dónde está X" },
    service: "cartera",
  },
  {
    quote:
      "Implementamos en una semana, migración incluida. La curva de aprendizaje fue mínima — los agentes la usan desde el día 2.",
    author: "Camila Pino",
    role: "Head of Marketing",
    agency: "Mediterráneo Brokers",
    location: "Reñaca, Viña del Mar",
    avatar: "https://i.pravatar.cc/200?img=25",
    rating: 5,
    metric: { value: "7 días", label: "para estar operando" },
    service: "cartera",
  },
  {
    quote:
      "Multi-oficina con permisos por agente fue lo que nos hizo decidir. Cada sucursal ve lo suyo, gerencia ve todo, sin enredos.",
    author: "Rodrigo Mancilla",
    role: "COO",
    agency: "Atlas Brokers",
    location: "Lo Barnechea, Santiago",
    avatar: "https://i.pravatar.cc/200?img=15",
    rating: 5,
    metric: { value: "5", label: "oficinas centralizadas" },
    service: "reportes",
  },
  {
    quote:
      "El soporte responde rápido y en español. Cuando dudamos en algo nos hicieron una sesión personalizada el mismo día.",
    author: "Daniela Saldías",
    role: "Sales Lead",
    agency: "Casas del Sur",
    location: "Concepción",
    avatar: "https://i.pravatar.cc/200?img=29",
    rating: 5,
    metric: { value: "<1h", label: "tiempo de respuesta" },
    service: "captacion",
  },
  {
    quote:
      "WhatsApp Business conectado al CRM cambió el juego. Cada lead llega con su origen marcado y va automáticamente al agente correcto.",
    author: "Sebastián Wagner",
    role: "Founder",
    agency: "Wagner Properties",
    location: "Pucón",
    avatar: "https://i.pravatar.cc/200?img=68",
    rating: 5,
    metric: { value: "+62%", label: "conversión WhatsApp" },
    service: "captacion",
  },
];

export const FEATURED_REVIEW = REVIEWS[0];

export const REVIEW_STATS = {
  rating: "4.9",
  reviewCount: "1.247",
  agencyCount: "200+",
  recommendation: "98%",
};
