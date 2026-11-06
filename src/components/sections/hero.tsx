import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";

import {
  siteConfig,
  whatsappAgendarMessage,
  whatsappUrl,
} from "@/config/site";
import { Button } from "@/components/ui/button";

export function Hero() {
  const agendarHref = whatsappUrl(whatsappAgendarMessage);

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="relative h-full min-h-[24rem] w-full sm:min-h-[28rem] md:min-h-[30rem]">
          <Image
            src="/hero-dr-geoluque.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-image-enter object-cover object-[center_22%] opacity-[0.34]"
          />
        </div>
        <div className="from-background via-background/86 absolute inset-0 bg-gradient-to-br to-primary/[0.06]" />
        <div
          className="animate-hero-gradient motion-reduce:animate-none absolute inset-0 bg-[length:220%_220%] bg-[linear-gradient(125deg,oklch(0.97_0.035_350_/_0.55)_0%,transparent_38%,oklch(0.95_0.04_320_/_0.35)_55%,transparent_75%)] opacity-80"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_18%_88%,oklch(0.98_0_0_/_0.85),transparent_58%)]"
          aria-hidden
        />
      </div>
      <div className="section-shell relative py-20 sm:py-28 md:py-32">
        <div className="hero-content-enter max-w-2xl md:max-w-[26rem]">
          <p className="text-primary mb-3 text-xs font-semibold uppercase tracking-[0.2em]">
            Consultorio · Portoviejo
          </p>
          <h1 className="font-heading text-foreground max-w-xl text-balance text-4xl font-semibold tracking-tight drop-shadow-[0_1px_40px_oklch(1_0_0_/_0.35)] sm:text-5xl md:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="text-primary/90 mt-3 text-lg font-medium sm:text-xl">
            {siteConfig.specialty}
          </p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.tagline}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="shadow-primary/15 hover:shadow-primary/25 h-11 rounded-xl px-6 shadow-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 sm:h-10"
              render={<a href={agendarHref} />}
              nativeButton={false}
              size="lg"
            >
              <Calendar data-icon="inline-start" />
              Agendar cita
            </Button>
            <Button
              className="border-primary/15 hover:border-primary/25 hover:bg-primary/[0.04] h-11 rounded-xl px-6 backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 sm:h-10"
              render={
                <a
                  href={siteConfig.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              variant="outline"
              size="lg"
            >
              <MapPin data-icon="inline-start" />
              Ubicación
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
