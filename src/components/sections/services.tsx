import { siteConfig } from "@/config/site";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Services() {
  return (
    <section id="servicios" className="section-shell py-20 sm:py-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
            Lo que hacemos
          </p>
          <h2 className="section-title mt-1">Servicios</h2>
        </div>
      </div>
      <p className="section-lead mt-1">
        Consulta ginecológica, obstetricia y acompañamiento en salud de la mujer.
      </p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {siteConfig.services.map((service, i) => (
          <li key={service.title}>
            <Card
              className={`group/card border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.06] ${
                i % 2 === 0 ? "motion-safe:md:translate-y-1" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-base transition-colors group-hover/card:text-primary">
                  {service.title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
