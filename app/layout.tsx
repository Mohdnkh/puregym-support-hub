import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PureGym Support Hub",
  description: "PureGym scripts, AI support, and calculation tools",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/pg-logo.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
