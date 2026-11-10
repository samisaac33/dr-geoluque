export function SiteBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Malla suave con ligero movimiento (deshabilitado si prefers-reduced-motion) */}
      <div className="animate-mesh-shift absolute inset-[-20%] bg-[radial-gradient(ellipse_85%_65%_at_12%_-8%,oklch(0.93_0.11_350_/_0.75),transparent_55%),radial-gradient(ellipse_70%_55%_at_88%_8%,oklch(0.92_0.13_320_/_0.52),transparent_50%),radial-gradient(ellipse_60%_50%_at_50%_105%,oklch(0.95_0.08_340_/_0.38),transparent_45%)] opacity-90" />
      <div className="bg-background/45 absolute inset-0 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(1_0_0)_0%,transparent_18%,transparent_82%,oklch(0.98_0.04_350)_100%)]" />
    </div>
  );
}
