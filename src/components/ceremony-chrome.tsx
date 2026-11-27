"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const CEREMONY_PREFIXES = [
  "/home",
  "/reveal",
  "/revelacion",
  "/profesional",
  "/setup",
];

export function isCeremonyPath(pathname: string): boolean {
  return CEREMONY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Oculta el botón flotante y el fondo del sitio médico durante la ceremonia. */
export function CeremonyChromeGuard({
  children,
  hide = false,
}: {
  children: ReactNode;
  hide?: boolean;
}) {
  const pathname = usePathname();
  if (hide || isCeremonyPath(pathname)) {
    return null;
  }
  return children;
}