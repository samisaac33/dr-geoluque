import { Calendar, ExternalLink } from "lucide-react";

import {
  siteConfig,
  whatsappAgendarMessage,
  whatsappUrl,
} from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  const agendarHref = whatsappUrl(whatsappAgendarMessage);

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.92_0.04_350),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <Badge variant="secondary" className="mb-4">
          Fase 0 · Carta de presentación
        </Badge>
        <h1 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground sm:text-xl">
          {siteConfig.specialty}
        </p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {siteConfig.tagline}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button render={<a href={agendarHref} />} nativeButton={false} size="lg">
            <Calendar data-icon="inline-start" />
            Agendar cita
          </Button>
          <Button
            render={
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            <ExternalLink data-icon="inline-start" />
            Instagram
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Próximamente: agendamiento con chatbot sincronizado con la agenda del
          consultorio.
        </p>
      </div>
    </section>
  );
}
