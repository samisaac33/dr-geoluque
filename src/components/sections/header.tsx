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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 shadow-[0_1px_0_0_oklch(0_0_0_/_0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="section-shell flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <Link
          href="/"
          className="font-heading group flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90 sm:gap-3 sm:text-base"
        >
          <span
            className="bg-primary/10 text-primary ring-primary/8 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-[transform,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md sm:size-10"
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
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 font-medium transition-[color,background-color] duration-200 hover:bg-primary/[0.06]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contacto"
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 rounded-xl shadow-primary/15 hover:shadow-primary/25 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px",
          )}
        >
          Agendar cita
        </a>
      </div>
    </header>
  );
}
