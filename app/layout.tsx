import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResuMatch AI",
  description: "Tailor a structured resume to a target job description with AI."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
