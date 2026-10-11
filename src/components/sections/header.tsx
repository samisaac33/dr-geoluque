import Link from "next/link";

import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-sm font-semibold tracking-tight sm:text-base"
        >
          {siteConfig.name}
          <span className="text-muted-foreground hidden font-normal sm:inline">
            {" "}
            · {siteConfig.specialty}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contacto"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          Agendar cita
        </a>
      </div>
    </header>
  );
}
