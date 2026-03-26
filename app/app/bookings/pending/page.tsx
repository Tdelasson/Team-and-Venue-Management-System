"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { BookingCard } from "../../components/BookingCard";
import { apiFetch } from "@/lib/api";
import type { BookingWithRelations } from "@/lib/types";

export default function PendingBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = await apiFetch("/api/bookings?status=PENDING");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === "ADMIN") fetchPending();
  }, [user]);

  const handleAction = async (bookingId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(bookingId);
    const res = await apiFetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } else {
      const data = await res.json();
      alert(data.error || "Fejl ved handling");
    }
    setActionLoading(null);
  };

  const handleApproveGroup = async (recurringGroupId: string) => {
    const groupBookings = bookings.filter((b) => b.recurringGroupId === recurringGroupId);
    for (const b of groupBookings) {
      await handleAction(b.id, "APPROVED");
    }
  };

  if (authLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!user || user.role !== "ADMIN") {
    return <div className="alert alert-warning"><span>Kun admins har adgang til denne side.</span></div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Ventende bookinger</h1>

      {loading ? (
        <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info"><span>Ingen ventende bookinger.</span></div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={
                <div className="flex items-center gap-2">
                  {booking.recurringGroupId && bookings.filter((b) => b.recurringGroupId === booking.recurringGroupId).length > 1 && (
                    <button
                      className="btn btn-sm btn-outline btn-success"
                      onClick={() => handleApproveGroup(booking.recurringGroupId!)}
                      disabled={actionLoading !== null}
                    >
                      Godkend serie
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleAction(booking.id, "APPROVED")}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? <span className="loading loading-spinner loading-xs"></span> : "Godkend"}
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleAction(booking.id, "REJECTED")}
                    disabled={actionLoading === booking.id}
                  >
                    Afvis
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
