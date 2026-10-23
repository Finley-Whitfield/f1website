import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex Racing Hub — The home of speed",
  description: "Every lap, every driver, every story. Your ultimate Formula One companion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
