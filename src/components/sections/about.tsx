import { Check } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

export function About() {
  return (
    <section
      id="sobre-mi"
      className="border-y border-border/60 bg-muted/30 py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Sobre mí
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          {siteConfig.description} Puedes agendar cita por WhatsApp o revisar la
          sección de contacto en este sitio.
        </p>
        <Separator className="my-8" />
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Formación y credenciales
        </h3>
        <ul className="mt-4 space-y-2">
          {siteConfig.credentials.map((item) => (
            <li key={item} className="flex gap-2 text-sm sm:text-base">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <ul className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
          {siteConfig.trustPoints.map((point) => (
            <li
              key={point}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
