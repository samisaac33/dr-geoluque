import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { CeremonyAudioUnlock } from "./CeremonyAudioUnlock";

export const metadata: Metadata = {
  title: "Dr. Geovanny Luque · Revelación de sexo fetal",
  description:
    "Ceremonia biométrica de revelación preparada por el Dr. Geovanny Luque, Gineco-Obstetra.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function CeremoniaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#05070f] text-white lg:min-h-screen">
      <CeremonyAudioUnlock />
      {children}
    </div>
  );
}