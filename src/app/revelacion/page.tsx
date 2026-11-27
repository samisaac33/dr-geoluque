import { redirect } from "next/navigation";

/** Atajo público para la ceremonia familiar (sin exponer el panel médico). */
export default function RevelacionShortcutPage() {
  redirect("/home");
}