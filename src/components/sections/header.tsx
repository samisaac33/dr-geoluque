import Link from "next/link";

import { Baby } from "lucide-react";

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
          className="font-heading flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight sm:gap-2.5 sm:text-base"
        >
          <span
            className="bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10"
            aria-hidden
          >
            <Baby className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 leading-tight">
            {siteConfig.name}
            <span className="text-muted-foreground hidden font-normal sm:inline">
              {" "}
              · {siteConfig.specialty}
            </span>
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
