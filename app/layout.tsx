import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

// Inter renders Latin text; Cairo covers Arabic. Listing Inter first in the
// CSS stack means Latin uses Inter and Arabic glyphs fall through to Cairo.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

export const metadata: Metadata = {
  title: "PureGym Hub",
  description: "PureGym Hub: scripts, AI support, tickets, and calculation tools",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/pg-hub-mark.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
