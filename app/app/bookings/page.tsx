"use client";

import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { BookingCalendar } from "../components/BookingCalendar";

export default function BookingsPage() {
  const { user } = useAuth();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Banekalender</h1>
        {user?.role === "COACH" && (
          <Link href="/bookings/new" className="btn btn-primary btn-sm">
            + Opret booking
          </Link>
        )}
      </div>

      {!user && (
        <div className="alert alert-info mb-4">
          <span>Log ind for at interagere med bookinger.</span>
        </div>
      )}

      <BookingCalendar />
    </section>
  );
}
