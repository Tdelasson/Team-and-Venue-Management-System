import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { NavBar } from "./components/NavBar";
import { RoleSwitcher } from "./components/RoleSwitcher";

export const metadata: Metadata = {
  title: "Banebookingssystem Prototype",
  description: "Hackathon prototype for team and venue management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  return (
    <html lang="da" className="h-full">
      <body className="min-h-full bg-base-200 text-base-content">
        <AuthProvider>
          <NavBar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
            {children}
          </main>
          <RoleSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}
