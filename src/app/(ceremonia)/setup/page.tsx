import { redirect } from "next/navigation";

/** Ruta legada: la familia no debe acceder al panel médico. */
export default function LegacySetupRedirect() {
  redirect("/");
}