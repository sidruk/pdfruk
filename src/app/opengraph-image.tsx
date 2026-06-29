import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pdfruk — Free Privacy-First PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "64px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#e63946",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            PDF
          </div>
          <span style={{ fontSize: "48px", fontWeight: 700 }}>pdfruk</span>
        </div>
        <p
          style={{
            fontSize: "36px",
            fontWeight: 600,
            lineHeight: 1.3,
            maxWidth: "900px",
            margin: 0,
          }}
        >
          Free PDF tools that respect your privacy
        </p>
        <p
          style={{
            fontSize: "24px",
            color: "#a3a3a3",
            marginTop: "24px",
            maxWidth: "800px",
          }}
        >
          Merge, split, convert & edit — 100% in your browser. No uploads.
        </p>
      </div>
    ),
    { ...size },
  );
}
