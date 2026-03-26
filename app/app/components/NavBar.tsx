"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

const roleBadge: Record<string, string> = {
  ADMIN: "badge-error",
  COACH: "badge-warning",
  PLAYER: "badge-info",
  SPECTATOR: "badge-success",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  COACH: "Træner",
  PLAYER: "Spiller",
  SPECTATOR: "Tilskuer",
};

export function NavBar() {
  const { user } = useAuth();

  return (
    <div className="navbar border-b border-base-300 bg-base-100 px-4">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-lg">
          Banebooking
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1">
          <li>
            <Link href="/bookings">Kalender</Link>
          </li>
          <li>
            <Link href="/hold">Hold</Link>
          </li>
          {user?.role === "ADMIN" && (
            <li>
              <Link href="/bookings/pending">Ventende</Link>
            </li>
          )}
          {user?.role === "COACH" && (
            <li>
              <Link href="/bookings/new">Opret booking</Link>
            </li>
          )}
          {user?.role === "PLAYER" && (
            <li>
              <Link href="/bookings/my">Min kalender</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="flex items-center gap-2">
            <span className={`badge ${roleBadge[user.role]}`}>
              {roleLabel[user.role]}
            </span>
            <span className="text-sm">{user.name}</span>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            Log ind
          </Link>
        )}
      </div>
    </div>
  );
}
