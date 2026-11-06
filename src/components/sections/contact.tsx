import { Mail, MapPin, Phone } from "lucide-react";

import {
  siteConfig,
  whatsappAgendarMessage,
  whatsappUrl,
} from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Contact() {
  const agendarHref = whatsappUrl(whatsappAgendarMessage);

  return (
    <section id="contacto" className="section-shell pb-24 pt-16 sm:pb-28 sm:pt-20">
      <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
        Reserva
      </p>
      <h2 className="section-title mt-1">Contacto y citas</h2>
      <p className="section-lead mt-1">
        Consultorio en Portoviejo, Manabí. Escríbenos por WhatsApp para confirmar
        horarios y ubicación de atención.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Card className="border-border/60 bg-card/85 shadow-md backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Consultorio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-2">
              <MapPin className="size-4 shrink-0 text-foreground" />
              <span>
                {siteConfig.address.mapsUrl ? (
                  <a
                    href={siteConfig.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {siteConfig.address.line1}
                    {siteConfig.address.city
                      ? `, ${siteConfig.address.city}`
                      : null}
                    {siteConfig.address.region
                      ? ` (${siteConfig.address.region})`
                      : null}
                  </a>
                ) : (
                  <>
                    {siteConfig.address.line1}
                    {siteConfig.address.city
                      ? `, ${siteConfig.address.city}`
                      : null}
                  </>
                )}
              </span>
            </p>
            <p className="flex gap-2">
              <Phone className="size-4 shrink-0 text-foreground" />
              {siteConfig.phoneDisplay}
            </p>
            {siteConfig.email ? (
              <p className="flex gap-2">
                <Mail className="size-4 shrink-0 text-foreground" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-foreground hover:underline"
                >
                  {siteConfig.email}
                </a>
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-primary/12 from-primary/[0.06] via-card/90 flex flex-col justify-between border bg-linear-to-br to-card/95 shadow-lg shadow-primary/[0.07] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Agendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escríbenos por WhatsApp para solicitar cita. Te confirmamos
              horarios y detalles del consultorio.
            </p>
            <Button
              render={<a href={agendarHref} />}
              nativeButton={false}
              className="hover:shadow-primary/30 w-full rounded-xl shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 sm:w-auto"
              size="lg"
            >
              Solicitar cita
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
