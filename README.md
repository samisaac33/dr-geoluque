# Dr. Geovanny Luque — sitio web (Fase 0)

Carta de presentación y base del proyecto digital para **Dr. Geovanny Luque**, ginecólogo y obstetra. Instagram: [@dr.geoluque](https://www.instagram.com/dr.geoluque/).

Este repositorio es el **inicio** de un producto más amplio (agenda, chatbot, correos, expediente, Google Business Profile). Ver [ROADMAP.md](./ROADMAP.md).

## Requisitos

- Node.js 20+ (probado con v24)
- npm

## Desarrollo local

```powershell
cd C:\Users\sheid\Documents\dr-geoluque
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando        | Descripción              |
| -------------- | ------------------------ |
| `npm run dev`  | Servidor de desarrollo   |
| `npm run build`| Build de producción      |
| `npm run start`| Servir build             |
| `npm run lint` | ESLint                   |

## Estructura

```
src/
  app/                 # App Router (landing, aviso de privacidad)
  components/
    sections/          # Hero, servicios, contacto, etc.
    ui/                # Componentes shadcn
  config/
    site.ts            # Datos editables del consultorio (teléfono, dirección, WhatsApp)
```

Antes de publicar, completa **`src/config/site.ts`**: WhatsApp (`whatsappPhoneE164`), teléfono, dirección, credenciales y URL del sitio.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router, `src/`)
- React 19, TypeScript, Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com/)

## Despliegue (siguiente paso)

1. Subir el repo a GitHub.
2. Vincular con [Vercel](https://vercel.com).
3. Configurar `NEXT_PUBLIC_SITE_URL` y actualizar `siteConfig.url`.

## Variables de entorno

Copia `.env.example` a `.env.local` cuando avances a Fase 1. No subas secretos al repositorio.
