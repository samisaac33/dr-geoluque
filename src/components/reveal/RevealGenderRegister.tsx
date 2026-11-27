"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CLINICAL_BRAND } from "@/lib/reveal/clinical-brand";
import { REVEAL_ULTRASOUND_TTL_DAYS } from "@/lib/reveal/ultrasound-storage";
import { ultrasoundForToken } from "@/lib/reveal/blob-token";
import {
  fileToPreviewUrl,
  prepareUltrasoundFile,
  uploadUltrasoundForCeremony,
} from "@/lib/reveal/prepare-ultrasound";
import { encodeRevealToken } from "@/lib/reveal/token";
import type { RevealGender } from "@/lib/reveal/types";
import {
  DEFAULT_LABELS,
  MAX_CHILD_FINGERPRINTS,
  normalizeRevealLabels,
} from "@/lib/reveal/types";

const STORAGE_KEY = "reveal-ceremony-link";

type ModalStep = "confirm" | "success" | null;

type RegisterCopyVariant = "family" | "clinical";

interface RevealGenderRegisterProps {
  onSaved?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  redirectOnSuccess?: string;
  copyVariant?: RegisterCopyVariant;
}

const COPY: Record<
  RegisterCopyVariant,
  {
    intro: string;
    submit: string;
    confirmTitle: string;
    confirmBody: string;
    successBody: string;
    shareText: string;
  }
> = {
  family: {
    intro:
      "Selecciona el resultado y, si la familia lo desea, activa las huellas de los hijos.",
    submit: "Generar enlace para la ceremonia",
    confirmTitle: "¿Confirmas el resultado?",
    confirmBody:
      "Vas a registrar que el bebé es {gender}. Revisa bien antes de continuar.",
    successBody:
      "Resultado registrado: {headline}. Envía el enlace solo al contacto autorizado.",
    shareText:
      "Enlace de ceremonia — ábralo solo en el dispositivo acordado con la familia.",
  },
  clinical: {
    intro: "Seleccione el sexo fetal y genere el enlace privado para la familia.",
    submit: "Generar enlace para la familia",
    confirmTitle: "¿Confirma el registro clínico?",
    confirmBody:
      "Registrará el sexo fetal como {gender}. Verifique el dato antes de continuar.",
    successBody:
      "Registro listo ({headline}). Comparta el enlace con el contacto autorizado por los padres.",
    shareText: `Ceremonia de revelación — ${CLINICAL_BRAND.doctorName}`,
  },
};

function genderLabel(gender: RevealGender) {
  return gender === "boy" ? "niño" : "niña";
}

function genderHeadline(gender: RevealGender) {
  return gender === "boy" ? "Es un niño" : "Es una niña";
}

function shortenLinkForDisplay(url: string): string {
  if (url.length <= 64) return url;
  return `${url.slice(0, 36)}…${url.slice(-20)}`;
}

export function RevealGenderRegister({
  onSaved,
  onCancel,
  showCancel = false,
  redirectOnSuccess,
  copyVariant = "clinical",
}: RevealGenderRegisterProps) {
  const copy = COPY[copyVariant];
  const router = useRouter();
  const [gender, setGender] = useState<RevealGender | null>(null);
  const [includeChildren, setIncludeChildren] = useState(false);
  const [childNames, setChildNames] = useState<string[]>([""]);
  const [doctorPhrase, setDoctorPhrase] = useState("");
  const [modal, setModal] = useState<ModalStep>(null);
  const [ceremonyUrl, setCeremonyUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [ultrasoundBlob, setUltrasoundBlob] = useState<Blob | null>(null);
  const [ultrasoundPreview, setUltrasoundPreview] = useState<string | null>(
    null,
  );
  const [ultrasoundError, setUltrasoundError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const onUltrasoundFile = async (file: File | null) => {
    setUltrasoundError(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (!file) {
      setUltrasoundBlob(null);
      setUltrasoundPreview(null);
      return;
    }
    try {
      const prepared = await prepareUltrasoundFile(file);
      const preview = fileToPreviewUrl(prepared);
      previewUrlRef.current = preview;
      setUltrasoundBlob(prepared);
      setUltrasoundPreview(preview);
    } catch (e) {
      setUltrasoundBlob(null);
      setUltrasoundPreview(null);
      setUltrasoundError(
        e instanceof Error ? e.message : "No se pudo cargar la imagen.",
      );
    }
  };

  const addChildField = () => {
    setChildNames((prev) =>
      prev.length < MAX_CHILD_FINGERPRINTS ? [...prev, ""] : prev,
    );
  };

  const updateChildName = (index: number, value: string) => {
    setChildNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeChildField = (index: number) => {
    setChildNames((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const buildLabels = useCallback(() => {
    const children = includeChildren
      ? childNames.map((n) => n.trim()).filter(Boolean)
      : [];
    return normalizeRevealLabels({
      dad: DEFAULT_LABELS.dad,
      mom: DEFAULT_LABELS.mom,
      children,
    });
  }, [includeChildren, childNames]);

  const persistChoice = useCallback(
    (ultrasoundUrl?: string): string | null => {
    if (!gender) return null;
    const labels = buildLabels();
    if (includeChildren && labels.children.length === 0) {
      return null;
    }
    const token = encodeRevealToken({
      gender,
      doctorPhrase: doctorPhrase.trim() || undefined,
      ultrasoundUrl: ultrasoundUrl?.trim() || undefined,
      labels,
    });
    const path = `/reveal?k=${token}`;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}${path}`;
    sessionStorage.setItem(STORAGE_KEY, path);
    localStorage.setItem(STORAGE_KEY, token);
    setCeremonyUrl(fullUrl);
    onSaved?.();
    return fullUrl;
  },
  [gender, doctorPhrase, buildLabels, includeChildren, onSaved]);

  const ultrasoundRequired = copyVariant === "clinical";

  const openConfirm = () => {
    if (!gender) return;
    if (ultrasoundRequired && !ultrasoundBlob) return;
    if (includeChildren) {
      const names = childNames.map((n) => n.trim()).filter(Boolean);
      if (names.length === 0) return;
    }
    setModal("confirm");
  };

  const copyCeremonyLinkAfter = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* portapapeles no disponible */
    }
  }, []);

  const confirmAndSave = async () => {
    if (!gender) return;
    if (ultrasoundRequired && !ultrasoundBlob) return;
    setSaving(true);
    setUltrasoundError(null);
    try {
      let ultrasoundUrl: string | undefined;
      if (ultrasoundBlob) {
        const publicUrl = await uploadUltrasoundForCeremony(ultrasoundBlob);
        ultrasoundUrl = ultrasoundForToken(publicUrl);
      }
      const fullUrl = persistChoice(ultrasoundUrl);
      if (!fullUrl) return;
      setModal("success");
      void copyCeremonyLinkAfter(fullUrl);
    } catch (e) {
      setUltrasoundError(
        e instanceof Error ? e.message : "Error al guardar la ecografía.",
      );
    } finally {
      setSaving(false);
    }
  };

  const finishSuccess = useCallback(() => {
    setModal(null);
    if (redirectOnSuccess) {
      router.push(redirectOnSuccess);
    }
  }, [redirectOnSuccess, router]);

  const copyCeremonyLink = useCallback(async () => {
    if (!ceremonyUrl) return;
    try {
      await navigator.clipboard.writeText(ceremonyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* portapapeles no disponible */
    }
  }, [ceremonyUrl]);

  const shareCeremonyLink = useCallback(async () => {
    if (!ceremonyUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: "Ceremonia de revelación",
        text: copy.shareText,
        url: ceremonyUrl,
      });
    } catch {
      /* usuario canceló */
    }
  }, [ceremonyUrl, copy.shareText]);

  const accent =
    gender === "girl"
      ? "border-pink-400/40 bg-pink-500/10 text-pink-100"
      : "border-sky-400/40 bg-sky-500/10 text-sky-100";

  const childrenValid =
    !includeChildren || childNames.some((n) => n.trim().length > 0);
  const ultrasoundValid = !ultrasoundRequired || ultrasoundBlob !== null;

  return (
    <>
      <motion.div
        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-5 backdrop-blur-sm sm:p-6"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <p className="text-center text-xs leading-relaxed text-white/45">
          {copy.intro}
        </p>

        <motion.div
          className="mt-5 rounded-xl border border-teal-400/20 bg-teal-500/5 px-4 py-3 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-teal-200/70">
            Huellas base
          </p>
          <p className="mt-1 text-sm text-white/70">
            La ceremonia siempre incluye <strong className="text-white/90">Papá</strong> y{" "}
            <strong className="text-white/90">Mamá</strong>.
          </p>
        </motion.div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender("boy")}
            className={`rounded-2xl border py-4 text-sm font-medium transition ${
              gender === "boy"
                ? "border-sky-400/60 bg-sky-500/15 text-sky-100"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            Es Niño
          </button>
          <button
            type="button"
            onClick={() => setGender("girl")}
            className={`rounded-2xl border py-4 text-sm font-medium transition ${
              gender === "girl"
                ? "border-pink-400/60 bg-pink-500/15 text-pink-100"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            Es Niña
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="reveal-ultrasound"
            className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/40"
          >
            Ecografía del paciente {ultrasoundRequired ? "(requerida)" : ""}
          </label>
          <input
            id="reveal-ultrasound"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/*"
            className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border file:border-white/15 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              void onUltrasoundFile(f);
            }}
          />
          <p className="mt-2 text-xs text-white/35">
            Se adjunta al enlace privado de la familia. La imagen se conserva en
            almacenamiento temporal {REVEAL_ULTRASOUND_TTL_DAYS} días y luego se
            elimina automáticamente. No se guarda en historias clínicas del
            sistema.
          </p>
          {ultrasoundPreview ? (
            <motion.div
              className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ultrasoundPreview}
                alt="Vista previa de la ecografía"
                className="max-h-48 w-full object-contain"
              />
            </motion.div>
          ) : null}
          {ultrasoundError ? (
            <p className="mt-2 text-xs text-rose-300/90">{ultrasoundError}</p>
          ) : null}
        </div>

        <label className="mt-6 block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/40">
          Mensaje del profesional (opcional)
        </label>
        <input
          type="text"
          value={doctorPhrase}
          onChange={(e) => setDoctorPhrase(e.target.value)}
          placeholder="Ej. Signos vitales estables · latido fuerte"
          className="mt-2 w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/30"
          maxLength={120}
        />

        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white/85">
              Incluir hijos en la ceremonia
            </p>
            <p className="mt-0.5 text-xs text-white/40">
              3.ª, 4.ª y 5.ª huella (hasta {MAX_CHILD_FINGERPRINTS})
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includeChildren}
            onClick={() => setIncludeChildren((v) => !v)}
            className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
              includeChildren
                ? "border-teal-400/50 bg-teal-500/30"
                : "border-white/15 bg-white/10"
            }`}
          >
            <motion.span
              className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
              animate={{ left: includeChildren ? "1.65rem" : "0.25rem" }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {includeChildren ? (
            <motion.div
              className="mt-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {childNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateChildName(index, e.target.value)}
                    placeholder={`Nombre hijo/a ${index + 1}`}
                    className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/30"
                    maxLength={48}
                  />
                  {childNames.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeChildField(index)}
                      className="shrink-0 rounded-xl border border-white/10 px-3 text-white/45 hover:text-white/70"
                      aria-label="Quitar campo"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              {childNames.length < MAX_CHILD_FINGERPRINTS ? (
                <button
                  type="button"
                  onClick={addChildField}
                  className="w-full rounded-xl border border-dashed border-white/15 py-2.5 text-xs text-white/50 hover:border-white/30 hover:text-white/70"
                >
                  + Agregar otra huella de hijo/a
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          disabled={!gender || !childrenValid || !ultrasoundValid || saving}
          onClick={openConfirm}
          className="mt-6 w-full rounded-full border border-white/15 bg-white/10 py-3.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? "Guardando ecografía…" : copy.submit}
        </button>

        {showCancel && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 w-full text-center text-xs text-white/35 transition hover:text-white/55"
          >
            Cerrar
          </button>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {modal ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reveal-modal-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Cerrar"
              onClick={() => {
                if (modal === "confirm") setModal(null);
              }}
            />
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              {modal === "confirm" && gender ? (
                <>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                    Reconfirmar
                  </p>
                  <h2
                    id="reveal-modal-title"
                    className="mt-3 text-xl font-semibold text-white"
                  >
                    {copy.confirmTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {copy.confirmBody.split("{gender}")[0]}
                    <span
                      className={`rounded-lg border px-2 py-0.5 font-medium ${accent}`}
                    >
                      {genderLabel(gender)}
                    </span>
                    {copy.confirmBody.split("{gender}")[1] ?? ""}
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="flex-1 rounded-full border border-white/15 py-3 text-sm text-white/70 transition hover:bg-white/5"
                    >
                      Corregir
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void confirmAndSave()}
                      className={`flex-1 rounded-full border py-3 text-sm font-medium disabled:opacity-50 ${
                        gender === "girl"
                          ? "border-pink-400/50 bg-pink-500/20 text-pink-50"
                          : "border-sky-400/50 bg-sky-500/20 text-sky-50"
                      }`}
                    >
                      Sí, confirmar
                    </button>
                  </div>
                </>
              ) : null}

              {modal === "success" && gender ? (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-2xl text-emerald-200">
                    ✓
                  </div>
                  <h2
                    id="reveal-modal-title"
                    className="mt-4 text-center text-xl font-semibold text-white"
                  >
                    Registro completado
                  </h2>
                  <p className="mt-3 text-center text-sm leading-relaxed text-white/65">
                    {copy.successBody.replace(
                      /\{headline\}/g,
                      genderHeadline(gender),
                    )}
                  </p>
                  {ceremonyUrl ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40">
                        Enlace de ceremonia
                      </p>
                      <p
                        className="mt-2 truncate text-sm text-emerald-200/90"
                        title={ceremonyUrl}
                      >
                        {shortenLinkForDisplay(ceremonyUrl)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Use copiar o compartir; el enlace completo no se muestra
                        en pantalla.
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => void copyCeremonyLink()}
                        className="mt-3 w-full rounded-full border border-emerald-400/35 bg-emerald-500/15 py-2.5 text-sm font-medium text-emerald-50"
                      >
                        {copied ? "Enlace copiado" : "Copiar enlace"}
                      </motion.button>
                    </div>
                  ) : null}
                  {typeof navigator !== "undefined" && "share" in navigator ? (
                    <button
                      type="button"
                      onClick={() => void shareCeremonyLink()}
                      className="mt-3 w-full rounded-full border border-white/15 py-2.5 text-sm text-white/80"
                    >
                      Compartir enlace…
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={finishSuccess}
                    className="mt-4 w-full rounded-full border border-amber-300/35 bg-amber-500/15 py-3.5 text-sm font-medium text-amber-50"
                  >
                    {redirectOnSuccess ? "Volver al inicio" : "Entendido"}
                  </button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}