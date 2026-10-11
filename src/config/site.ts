export const siteConfig = {
  name: "Dr. Geo Luque",
  specialty: "Ginecólogo y obstetra",
  tagline:
    "Atención integral en salud de la mujer, embarazo y acompañamiento en cada etapa.",
  description:
    "Consulta ginecológica, control prenatal y obstetricia con un enfoque humano y basado en evidencia. Sitio oficial del Dr. Geo Luque.",
  /** URL pública del sitio (actualizar al desplegar en Vercel o dominio propio). */
  url: "https://localhost:3000",
  locale: "es_MX",
  copyrightYear: 2026,
  instagram: "https://www.instagram.com/dr.geoluque/",
  /** Teléfono visible en el sitio (formato libre). Actualizar con datos del consultorio. */
  phoneDisplay: "Por confirmar",
  /** Número para wa.me: código de país + número, sin + ni espacios. Ej. México: 52XXXXXXXXXX */
  whatsappPhoneE164: "",
  email: "",
  address: {
    line1: "Consultorio — dirección por confirmar",
    city: "",
    region: "",
    mapsUrl: "",
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
  "Hola, Dr. Geo Luque. Me gustaría agendar una cita. ¿Qué horarios tiene disponibles?";
