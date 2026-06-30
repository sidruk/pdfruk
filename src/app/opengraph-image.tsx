import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pdfruk — Free Privacy-First PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function loadLogoSrc(): Promise<string> {
  const logoData = await fetch(
    new URL("../../public/logo.png", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return `data:image/png;base64,${arrayBufferToBase64(logoData)}`;
}

const BRAND_RED = "#d61a1a";
const BRAND_CHARCOAL = "#1d2129";
const MUTED = "#5c6370";
const BACKGROUND = "#f9f9f9";
const CARD = "#ffffff";
const BORDER = "#e4e4e7";

export default async function OpenGraphImage() {
  const logoSrc = await loadLogoSrc();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: BACKGROUND,
          overflow: "hidden",
        }}
      >
        {/* Soft background accents */}
        <div
          style={{
            position: "absolute",
            left: -100,
            top: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(214, 26, 26, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -100,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(29, 33, 41, 0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(214, 26, 26, 0.07), transparent)",
          }}
        />

        {/* Left: copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "56px 48px 56px 72px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              width={220}
              height={220}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid rgba(214, 26, 26, 0.2)`,
              background: "rgba(214, 26, 26, 0.05)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: BRAND_RED,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: BRAND_CHARCOAL,
              }}
            >
              Privacy-first · No uploads
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 46,
              fontWeight: 700,
              lineHeight: 1.15,
              color: BRAND_CHARCOAL,
              margin: 0,
              letterSpacing: "-0.02em",
              maxWidth: 620,
            }}
          >
            <span>Free PDF tools that respect your </span>
            <span style={{ color: BRAND_RED }}>privacy</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 22,
              lineHeight: 1.45,
              color: MUTED,
              marginTop: 20,
              maxWidth: 560,
            }}
          >
            Merge, split, convert & edit — 100% in your browser.
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 28,
            }}
          >
            {["Merge", "Split", "Convert", "Edit"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `1px solid ${BORDER}`,
                  background: CARD,
                  fontSize: 16,
                  fontWeight: 600,
                  color: BRAND_CHARCOAL,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: document mockups */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 420,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              right: 20,
              top: 90,
              width: 220,
              padding: 18,
              borderRadius: 14,
              background: CARD,
              border: `1px solid ${BORDER}`,
              transform: "rotate(6deg)",
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "rgba(214, 26, 26, 0.7)",
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 8,
                  borderRadius: 4,
                  background: "#f0f0f0",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 4,
                  background: "#f0f0f0",
                }}
              />
              <div
                style={{
                  width: "85%",
                  height: 8,
                  borderRadius: 4,
                  background: "#f0f0f0",
                }}
              />
              <div
                style={{
                  width: "70%",
                  height: 8,
                  borderRadius: 4,
                  background: "#f0f0f0",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <div
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 8,
                  background: "rgba(214, 26, 26, 0.1)",
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 8,
                  background: "#f0f0f0",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              left: 0,
              top: 150,
              width: 240,
              padding: 20,
              borderRadius: 14,
              background: CARD,
              border: `1px solid ${BORDER}`,
              transform: "rotate(-4deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: BRAND_RED,
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#f0f0f0",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "rgba(214, 26, 26, 0.1)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: BRAND_RED,
                }}
              >
                PDF
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 5,
                  background: "#f0f0f0",
                }}
              />
              <div
                style={{
                  width: "92%",
                  height: 10,
                  borderRadius: 5,
                  background: "#f0f0f0",
                }}
              />
              <div
                style={{
                  width: "78%",
                  height: 10,
                  borderRadius: 5,
                  background: "#f0f0f0",
                }}
              />
              <div
                style={{
                  width: "88%",
                  height: 10,
                  borderRadius: 5,
                  background: "#f0f0f0",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                height: 36,
                borderRadius: 8,
                background: BRAND_RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Download
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
