"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  Download01Icon,
  ImageUpload01Icon,
  Delete02Icon,
  Link01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  useAgencyQr,
  useUpdateAgencyQr,
  useUploadQrLogo,
} from "@/lib/queries";
import { toast } from "@/lib/toast";

const DEFAULT_URL = "https://valenciapro.cl";

export function QrTab() {
  const { data } = useAgencyQr();
  const update = useUpdateAgencyQr();
  const upload = useUploadQrLogo();

  const [url, setUrl] = useState(DEFAULT_URL);
  const [colorMain, setColorMain] = useState("#C7B593");
  const [colorBg, setColorBg] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string>("");

  const fileInput = useRef<HTMLInputElement>(null);
  const [previewEl, setPreviewEl] = useState<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // Sincroniza estado local con datos del servidor cuando cargan
  useEffect(() => {
    if (!data) return;
    setColorMain(data.color_main);
    setColorBg(data.color_bg);
    setLogoUrl(data.logo_url ?? "");
  }, [data]);

  // Inicializa el QR cuando el contenedor entra al DOM
  useEffect(() => {
    if (!previewEl) return;

    const code = new QRCodeStyling({
      width: 280,
      height: 280,
      type: "svg",
      data: url || DEFAULT_URL,
      image: logoUrl || undefined,
      dotsOptions: { color: colorMain, type: "rounded" },
      backgroundOptions: { color: colorBg },
      cornersSquareOptions: { color: colorMain, type: "extra-rounded" },
      cornersDotOptions: { color: colorMain, type: "dot" },
      imageOptions: { crossOrigin: "anonymous", margin: 8 },
    });

    previewEl.innerHTML = "";
    code.append(previewEl);
    qrRef.current = code;

    return () => {
      qrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewEl]);

  // Actualiza el QR cuando cambian los inputs
  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.update({
      data: url || DEFAULT_URL,
      image: logoUrl || undefined,
      dotsOptions: { color: colorMain, type: "rounded" },
      backgroundOptions: { color: colorBg },
      cornersSquareOptions: { color: colorMain, type: "extra-rounded" },
      cornersDotOptions: { color: colorMain, type: "dot" },
      imageOptions: { crossOrigin: "anonymous", margin: 8 },
    });
  }, [url, colorMain, colorBg, logoUrl]);

  const handleSaveDefaults = () => {
    toast.promise(
      update.mutateAsync({
        color_main: colorMain,
        color_bg: colorBg,
        logo_url: logoUrl || null,
      }),
      {
        loading: { title: "Guardando configuración…" },
        success: { title: "Configuración guardada" },
        error: (err: unknown) => ({
          title: "Error al guardar",
          description: err instanceof Error ? err.message : "Error desconocido",
        }),
      },
    );
  };

  const handleDownload = () => {
    qrRef.current?.download({ name: "qr-valencia", extension: "png" });
  };

  const handleUpload = async (file: File) => {
    const r = await toast.promise(upload.mutateAsync(file), {
      loading: { title: "Subiendo logo…" },
      success: { title: "Logo actualizado" },
      error: (err: unknown) => ({
        title: "Error al subir",
        description: err instanceof Error ? err.message : "",
      }),
    });
    setLogoUrl(r.logo_url);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
      {/* Configuración */}
      <Card className="p-5">
        <h3 className="text-base font-semibold">Generador QR</h3>
        <p className="mt-0.5 text-sm text-foreground-muted">
          Genera códigos QR con el branding de tu agencia. Los colores y logo
          se aplican como configuración por defecto a todos los QR de fichas
          públicas.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="URL de destino" hint="Genera un QR para cualquier link">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={DEFAULT_URL}
              leading={<Icon icon={Link01Icon} size={13} />}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Color principal">
              <ColorPicker value={colorMain} onChange={setColorMain} />
            </Field>
            <Field label="Color fondo">
              <ColorPicker value={colorBg} onChange={setColorBg} />
            </Field>
          </div>

          <Field label="Logo central" hint="PNG con fondo transparente · máx. 5 MB">
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-muted/30 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-white">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Icon
                    icon={ImageUpload01Icon}
                    size={18}
                    className="text-foreground-muted"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                  loading={upload.isPending}
                >
                  <Icon icon={ImageUpload01Icon} size={13} />
                  {logoUrl ? "Cambiar logo" : "Subir logo"}
                </Button>
                {logoUrl && (
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                  >
                    <Icon icon={Delete02Icon} size={13} />
                    Quitar
                  </Button>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
          </Field>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveDefaults} loading={update.isPending}>
              <Icon icon={CheckmarkCircle02Icon} size={14} />
              Guardar como configuración por defecto
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview + descarga */}
      <Card className="flex flex-col items-center gap-4 p-5">
        <h3 className="text-base font-semibold">Vista previa</h3>
        <div
          className="rounded-2xl p-6 shadow-card"
          style={{ backgroundColor: colorBg }}
        >
          <div
            ref={setPreviewEl}
            className="flex h-[280px] w-[280px] items-center justify-center"
          />
        </div>
        <Button onClick={handleDownload} className="w-full" style={{ backgroundColor: colorMain }}>
          <Icon icon={Download01Icon} size={14} />
          Descargar PNG
        </Button>
        <p className="text-center text-[11px] text-foreground-muted">
          El QR se actualiza en vivo según los colores y logo de la izquierda.
        </p>
      </Card>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
      />
      <Input
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="h-7 flex-1 border-0 bg-transparent font-mono text-[12px] focus-visible:ring-0"
        maxLength={7}
      />
    </div>
  );
}
