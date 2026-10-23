import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { WhatsAppFloatingButton } from "@/components/whatsapp-floating-button";
import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = `${siteConfig.name} | ${siteConfig.specialty}`;

export const metadata: Metadata = {
  metadataBase: new URL(
    siteConfig.url.startsWith("http") ? siteConfig.url : "http://localhost:3000",
  ),
  title: {
    default: siteTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    title: siteTitle,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteConfig.description,
  },
  alternates: {
    canonical: "/",
  },
};

const physicianJsonLd = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: siteConfig.name,
  medicalSpecialty: "Gynecologic",
  description: siteConfig.description,
  sameAs: [siteConfig.instagram],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(physicianJsonLd),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
