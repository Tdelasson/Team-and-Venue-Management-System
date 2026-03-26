import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banebookingssystem Prototype",
  description: "Prototype for team and venue management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full antialiased" data-theme="winter">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
