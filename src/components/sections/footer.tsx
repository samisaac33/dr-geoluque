import Link from "next/link";

import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-primary/8 mt-auto border-t bg-linear-to-t from-muted/25 to-background">
      <div className="section-shell py-12 sm:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {siteConfig.copyrightYear} {siteConfig.name}. Todos los derechos
            reservados.
          </p>
          <nav className="flex flex-wrap gap-2 text-sm sm:gap-4">
            <Link
              href="/aviso-privacidad"
              className="text-muted-foreground hover:text-foreground rounded-lg px-2 py-1 transition-[color,background-color] hover:bg-primary/[0.06]"
            >
              Aviso de privacidad
            </Link>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground rounded-lg px-2 py-1 transition-[color,background-color] hover:bg-primary/[0.06]"
            >
              Instagram
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
