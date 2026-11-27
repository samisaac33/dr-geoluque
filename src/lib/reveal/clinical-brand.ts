import { siteConfig } from "@/config/site";

/** Identidad del especialista que ofrece la ceremonia de revelación. */
export const CLINICAL_BRAND = {
  doctorName: siteConfig.name,
  specialty: siteConfig.specialty,
  shortLine: `${siteConfig.name} · ${siteConfig.specialty}`,
  /**
   * Ruta sin enlaces públicos: solo el médico la guarda en favoritos.
   */
  professionalPath: "/profesional/registro-clinico",
} as const;