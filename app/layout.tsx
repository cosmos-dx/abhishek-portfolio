import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({ variable: "--font-sans", subsets: ["latin"], weight: ["200", "300", "400", "500", "700", "800"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "Abhishek Gupta",
  description: "Portfolio of Abhishek Gupta: backend systems and AI products built to scale and optimised for real-world use.",
};

export const viewport: Viewport = { themeColor: "#f5f3ed" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
