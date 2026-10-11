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
    <section id="contacto" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        Contacto y citas
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Completa teléfono, WhatsApp y dirección en{" "}
        <code className="rounded bg-muted px-1 text-xs">src/config/site.ts</code>{" "}
        antes de publicar el sitio.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultorio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-2">
              <MapPin className="size-4 shrink-0 text-foreground" />
              <span>
                {siteConfig.address.line1}
                {siteConfig.address.city
                  ? `, ${siteConfig.address.city}`
                  : null}
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
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base">Agendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por ahora la cita se solicita por WhatsApp o Instagram. En la
              siguiente fase del proyecto: chatbot en esta web conectado a la
              agenda en tiempo real.
            </p>
            <Button
              render={<a href={agendarHref} />}
              nativeButton={false}
              className="w-full sm:w-auto"
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
