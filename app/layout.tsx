import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PureGym Hub",
  description: "PureGym scripts, AI support, knowledge base, and calculation tools",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/pg-hub-mark.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
