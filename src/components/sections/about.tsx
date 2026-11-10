import Image from "next/image";

import { siteConfig } from "@/config/site";

export function About() {
  return (
    <section
      id="sobre-mi"
      className="relative overflow-hidden border-y border-border/50 bg-linear-to-b from-primary/[0.04] via-muted/40 to-background py-20 sm:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_20%,oklch(0.96_0.1_350_/_0.55),transparent)]"
        aria-hidden
      />
      <div className="section-shell relative">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-12 lg:gap-14">
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
              Confianza
            </p>
            <h2 className="section-title mt-1">Sobre mí</h2>
            <p className="section-lead mt-2 max-w-2xl md:max-w-none">
              {siteConfig.description} Puedes agendar cita por WhatsApp o
              revisar la sección de contacto en este sitio.
            </p>
          </div>
          <figure className="mx-auto w-full max-w-md md:order-none md:mx-0 md:max-w-none md:justify-self-end">
            <div className="ring-primary/12 relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl shadow-primary/[0.08] ring-1">
              <Image
                src="/hero-dr-geoluque.jpg"
                alt={`${siteConfig.name}, ${siteConfig.specialty}`}
                fill
                sizes="(min-width: 768px) 38vw, 100vw"
                className="object-cover object-[center_22%]"
              />
            </div>
            <figcaption className="text-muted-foreground mt-3 text-center text-xs md:text-left">
              {siteConfig.name}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
