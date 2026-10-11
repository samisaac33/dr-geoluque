import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {siteConfig.copyrightYear} {siteConfig.name}. Todos los derechos
            reservados.
          </p>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/aviso-privacidad"
              className="text-muted-foreground hover:text-foreground"
            >
              Aviso de privacidad
            </Link>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Instagram
            </a>
          </nav>
        </div>
        <Separator className="my-6" />
        <p className="text-xs text-muted-foreground">
          Este sitio no sustituye una consulta médica. Ante urgencias, acude a
          servicios de emergencia.
        </p>
      </div>
    </footer>
  );
}
