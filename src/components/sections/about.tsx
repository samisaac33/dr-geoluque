import { Check } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

export function About() {
  return (
    <section
      id="sobre-mi"
      className="relative overflow-hidden border-y border-border/50 bg-linear-to-b from-primary/[0.04] via-muted/40 to-background py-20 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_20%,oklch(0.97_0.04_350_/_0.5),transparent)]"
        aria-hidden
      />
      <div className="section-shell relative">
        <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
          Confianza
        </p>
        <h2 className="section-title mt-1">Sobre mí</h2>
        <p className="section-lead mt-2 max-w-2xl">
          {siteConfig.description} Puedes agendar cita por WhatsApp o revisar la
          sección de contacto en este sitio.
        </p>
        <Separator className="my-10 max-w-md bg-gradient-to-r from-primary/25 via-border to-transparent" />
        <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.15em]">
          Formación y credenciales
        </h3>
        <ul className="mt-5 space-y-3">
          {siteConfig.credentials.map((item) => (
            <li key={item} className="flex gap-3 text-sm sm:text-base">
              <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                <Check className="size-3" strokeWidth={2.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <ul className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {siteConfig.trustPoints.map((point) => (
            <li
              key={point}
              className="border-primary/8 hover:border-primary/18 rounded-xl border bg-background/90 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
