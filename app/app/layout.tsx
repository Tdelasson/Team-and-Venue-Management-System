import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banebookingssystem Prototype",
  description: "Hackathon prototype for team and venue management",
};

const navItems = [
  { href: "/bookings", label: "Bane-booking" },
  { href: "/hold", label: "Hold" }
];

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
        <div className="navbar border-b border-base-300 bg-base-100 px-4">
          <div className="navbar-start">
            <Link href="/" className="btn btn-ghost text-lg">
              Banebooking
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 px-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="navbar-end">
            {username ? (
              <p className="text-sm font-medium">
                Logged in as: {username}
                {userRole ? ` (${userRole})` : ""}
              </p>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">
                Log ind
              </Link>
            )}
          </div>
        </div>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
