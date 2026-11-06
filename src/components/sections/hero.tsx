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
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="relative h-full min-h-[22rem] w-full sm:min-h-[26rem]">
          <Image
            src="/hero-dr-geoluque.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_22%] opacity-[0.32]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/45" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.92_0.04_350_/_0.55),transparent)]"
          aria-hidden
        />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
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
    </section>
  );
}
