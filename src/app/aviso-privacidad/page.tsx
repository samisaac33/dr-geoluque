import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: `Aviso de privacidad del sitio de ${siteConfig.name}.`,
};

export default function AvisoPrivacidadPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Aviso de privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Borrador para revisión legal y médica antes de publicación.
        </p>
        <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground dark:prose-invert">
          <p>
            <strong className="text-foreground">{siteConfig.name}</strong>{" "}
            (en adelante, el &quot;Responsable&quot;) es responsable del
            tratamiento de los datos personales que usted proporcione a través
            de este sitio web, WhatsApp, correo electrónico o durante la
            prestación de servicios médicos.
          </p>
          <p>
            Los datos que se recaben podrán incluir: nombre, datos de contacto,
            información relacionada con citas y, en su caso, datos de salud
            conforme a la normativa aplicable. Serán utilizados para agendar
            consultas, dar seguimiento médico, enviar recordatorios y cumplir
            obligaciones legales.
          </p>
          <p>
            Usted puede ejercer sus derechos de acceso, rectificación,
            cancelación y oposición (ARCO) u equivalentes contactando al
            Responsable en los medios publicados en la sección de contacto, una
            vez confirmados.
          </p>
          <p>
            Este documento será sustituido por un aviso de privacidad integral
            redactado o validado por el médico y, si aplica, por asesoría legal
            antes de activar formularios, chatbot o base de datos de pacientes.
          </p>
        </div>
        <p className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Volver al inicio
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
