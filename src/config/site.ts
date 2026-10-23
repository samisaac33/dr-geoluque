export const siteConfig = {
  name: "Dr. Geovanny Luque",
  specialty: "Ginecólogo y obstetra",
  tagline:
    "Atención integral en salud de la mujer, embarazo y acompañamiento en cada etapa.",
  description:
    "Consulta ginecológica, control prenatal y obstetricia con un enfoque humano y basado en evidencia. Sitio oficial del Dr. Geovanny Luque.",
  /** URL pública del sitio (actualizar al desplegar en Vercel o dominio propio). */
  url: "https://localhost:3000",
  locale: "es_MX",
  copyrightYear: 2026,
  instagram: "https://www.instagram.com/dr.geoluque/",
  /** Teléfono visible en el sitio (formato libre). Actualizar con datos del consultorio. */
  phoneDisplay: "095 873 1324",
  /** Número para wa.me: código de país + número, sin + ni espacios. Ej. México: 52XXXXXXXXXX */
  whatsappPhoneE164: "593958731324",
  email: "",
  address: {
    line1: "Centro Médico Los Ceibos (Av. Reales Tamarindos y Rotaria)",
    city: "Portoviejo",
    region: "Manabí, Ecuador",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Centro+M%C3%A9dico+Los+Ceibos+Portoviejo",
  },
  credentials: [
    "Ginecología y obstetricia",
    "Formación y cédula profesional — por confirmar con el médico",
  ],
  services: [
    {
      title: "Consulta ginecológica",
      description:
        "Evaluación, prevención y seguimiento de la salud reproductiva y general de la mujer.",
    },
    {
      title: "Control prenatal",
      description:
        "Seguimiento del embarazo con revisiones periódicas, orientación y coordinación de estudios.",
    },
    {
      title: "Obstetricia",
      description:
        "Acompañamiento durante el embarazo, parto y posparto inmediato según tu plan de atención.",
    },
    {
      title: "Puerperio y lactancia",
      description:
        "Apoyo en recuperación posparto, lactancia materna y signos de alarma a vigilar.",
    },
  ],
  trustPoints: [
    "Comunicación clara y respetuosa",
    "Enfoque en evidencia médica",
    "Acompañamiento en decisiones informadas",
  ],
} as const;

export function whatsappUrl(message: string): string {
  const phone = siteConfig.whatsappPhoneE164.trim();
  if (!phone) {
    return siteConfig.instagram;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const whatsappAgendarMessage =
  "Hola, Dr. Geovanny Luque. Me gustaría agendar una cita. ¿Qué horarios tiene disponibles?";
