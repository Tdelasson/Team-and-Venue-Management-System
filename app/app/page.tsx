"use client";

import Link from "next/link";
import { useAuth } from "./components/AuthProvider";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { BookingCard } from "./components/BookingCard";
import type { BookingWithRelations } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<BookingWithRelations[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/bookings?status=APPROVED")
      .then((r) => r.json())
      .then((data) => {
        const now = new Date();
        const future = data
          .filter((b: BookingWithRelations) => new Date(b.startTime) > now)
          .slice(0, 3);
        setUpcoming(future);
      });

    if (user?.role === "ADMIN") {
      apiFetch("/api/bookings?status=PENDING")
        .then((r) => r.json())
        .then((data) => setPendingCount(data.length));
    }
  }, [user]);

  return (
    <section className="space-y-6">
      <div className="rounded-box border border-base-300 bg-base-100 p-6">
        <h1 className="text-3xl font-bold">Campus Fodbold Banebooking</h1>
        <p className="mt-2 text-base-content/80">
          Book banen til træning og kampe, se kalenderen og tilmeld dig.
        </p>
      </div>

      {/* Role-specific CTAs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === "ADMIN" && pendingCount > 0 && (
          <Link href="/bookings/pending" className="card bg-warning/10 border border-warning shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-warning">{pendingCount} ventende bookinger</h2>
              <p>Der venter bookinger på godkendelse.</p>
              <div className="card-actions justify-end">
                <span className="btn btn-warning btn-sm">Se ventende →</span>
              </div>
            </div>
          </Link>
        )}

        <Link href="/bookings" className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Banekalender</h2>
            <p>Se ugentlig oversigt over alle bookinger.</p>
            <div className="card-actions justify-end">
              <span className="btn btn-primary btn-sm btn-outline">Åbn kalender →</span>
            </div>
          </div>
        </Link>

        {user?.role === "COACH" && (
          <Link href="/bookings/new" className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <h2 className="card-title">Opret booking</h2>
              <p>Book banen til træning eller kamp.</p>
              <div className="card-actions justify-end">
                <span className="btn btn-primary btn-sm">Opret →</span>
              </div>
            </div>
          </Link>
        )}

        {user?.role === "PLAYER" && (
          <Link href="/bookings/my" className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <h2 className="card-title">Min kalender</h2>
              <p>Se dit holds begivenheder og tilmeld dig.</p>
              <div className="card-actions justify-end">
                <span className="btn btn-info btn-sm btn-outline">Se kalender →</span>
              </div>
            </div>
          </Link>
        )}

        <Link href="/hold" className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Hold</h2>
            <p>Oversigt over tilmeldte hold.</p>
            <div className="card-actions justify-end">
              <span className="btn btn-sm btn-outline">Se hold →</span>
            </div>
          </div>
        </Link>

        {!user && (
          <Link href="/login" className="card bg-primary/10 border border-primary shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-primary">Log ind</h2>
              <p>Log ind for at booke banen og tilmelde dig.</p>
              <div className="card-actions justify-end">
                <span className="btn btn-primary btn-sm">Log ind →</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Kommende begivenheder</h2>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
