import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          background:
            "linear-gradient(135deg, #f6f1e8 0%, #fbf7ef 50%, #f3ecdf 100%)",
          color: "#1a1612",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow gold radial */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "radial-gradient(45% 45% at 80% 80%, rgba(201,169,110,0.30), transparent 70%), radial-gradient(40% 40% at 15% 15%, rgba(201,169,110,0.18), transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.5px",
          }}
        >
          Realtes<span style={{ color: "#c9a96e" }}>*</span>
        </div>

        {/* Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 56,
            padding: "8px 16px",
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 500,
            color: "rgba(26,22,18,0.8)",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 8,
              height: 8,
              borderRadius: 999,
              marginRight: 8,
              background: "#c9a96e",
            }}
          />
          #1 ERP + CRM inmobiliario en Chile
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            fontSize: 84,
            fontWeight: 500,
            lineHeight: 1.02,
            letterSpacing: "-2.5px",
          }}
        >
          <span style={{ display: "flex" }}>Tu corredora,</span>
          <span style={{ display: "flex" }}>
            operada con{" "}
            <span style={{ fontStyle: "italic", color: "#c9a96e" }}>
              &nbsp;elegancia
            </span>
            .
          </span>
        </div>

        {/* Sub */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            color: "rgba(26,22,18,0.65)",
            maxWidth: 950,
            lineHeight: 1.4,
          }}
        >
          Captación multicanal · CRM kanban · cargos automáticos · reportes en
          tiempo real.
        </div>

        {/* Footer row */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(26,22,18,0.55)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: 24,
            }}
          >
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                marginRight: 10,
                background: "#10b981",
              }}
            />
            realtes.cl
          </span>
          <span style={{ display: "flex", marginRight: 24 }}>·</span>
          <span style={{ display: "flex", marginRight: 24 }}>
            200+ corredoras activas
          </span>
          <span style={{ display: "flex", marginRight: 24 }}>·</span>
          <span style={{ display: "flex", color: "#c9a96e", fontWeight: 600 }}>
            14 días gratis
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
