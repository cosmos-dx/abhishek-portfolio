import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const alt = "Abhishek Gupta, portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Poster from the brand reference: charcoal field, big name, one orange accent. Drawn in code, no asset needed.
export default async function Image() {
  const { profile } = await getContent();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#111", color: "#f5f3ed", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", position: "relative" }}>
        <div style={{ position: "absolute", right: 140, top: 0, bottom: 0, width: 2, background: "#f06428", opacity: 0.6 }} />
        <div style={{ position: "absolute", right: 0, bottom: 150, width: 340, height: 2, background: "#f06428", opacity: 0.6 }} />
        <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: -10, lineHeight: 0.9, display: "flex" }}>{profile.first}</div>
        <div style={{ fontSize: 190, fontWeight: 300, letterSpacing: -10, lineHeight: 0.95, display: "flex", alignItems: "flex-end" }}>
          {profile.last}
          <div style={{ width: 80, height: 10, background: "#f06428", marginLeft: 16, marginBottom: 24 }} />
        </div>
        <div style={{ marginTop: 36, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7, display: "flex" }}>{profile.roles.join("  ×  ")}</div>
      </div>
    ),
    size,
  );
}
