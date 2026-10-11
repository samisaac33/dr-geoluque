import { siteConfig } from "@/config/site";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        Servicios
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Áreas de atención. El listado final será validado por el Dr. Geo Luque
        según su práctica actual.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {siteConfig.services.map((service) => (
          <li key={service.title}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
