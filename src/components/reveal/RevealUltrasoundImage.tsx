"use client";

import Image from "next/image";

interface RevealUltrasoundImageProps {
  src?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function RevealUltrasoundImage({
  src,
  alt = "Ecografía del paciente",
  className = "h-auto w-full object-contain",
  sizes = "100vw",
  priority = false,
}: RevealUltrasoundImageProps) {
  if (!src) {
    return (
      <div
        className={`flex min-h-[12rem] w-full items-center justify-center bg-black/40 px-4 text-center text-sm text-white/45 ${className}`}
      >
        Sin imagen de ecografía en este enlace.
      </div>
    );
  }

  if (src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL del token en modo respaldo
      <img src={src} alt={alt} className={className} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={960}
      height={720}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={src.includes("blob.vercel-storage.com")}
    />
  );
}