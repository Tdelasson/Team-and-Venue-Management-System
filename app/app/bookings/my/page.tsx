"use client";

import { useAuth } from "../../components/AuthProvider";
import { BookingCalendar } from "../../components/BookingCalendar";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { BookingWithRelations } from "@/lib/types";

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithRelations[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!user?.teamId) return;
    apiFetch(`/api/bookings?status=APPROVED&teamId=${user.teamId}`)
      .then((r) => r.json())
      .then((data) => {
        const now = new Date();
        setUpcomingBookings(data.filter((b: BookingWithRelations) => new Date(b.startTime) > now));
        setLoadingList(false);
      });
  }, [user]);

  if (authLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!user || user.role !== "PLAYER") {
    return <div className="alert alert-warning"><span>Kun spillere har adgang til denne side.</span></div>;
  }

  const handleParticipation = async (bookingId: string, status: "ATTENDING" | "NOT_ATTENDING") => {
    await apiFetch(`/api/bookings/${bookingId}/participate`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    // Refresh bookings
    const res = await apiFetch(`/api/bookings?status=APPROVED&teamId=${user.teamId}`);
    const data = await res.json();
    const now = new Date();
    setUpcomingBookings(data.filter((b: BookingWithRelations) => new Date(b.startTime) > now));
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Min kalender – {user.teamName}</h1>

      <div className="mb-8">
        <BookingCalendar teamId={user.teamId!} showFilters={false} />
      </div>

      <h2 className="text-xl font-semibold mb-3">Kommende begivenheder</h2>
      {loadingList ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner"></span></div>
      ) : upcomingBookings.length === 0 ? (
        <div className="alert alert-info"><span>Ingen kommende begivenheder for dit hold.</span></div>
      ) : (
        <div className="space-y-3">
          {upcomingBookings.map((booking) => {
            const myParticipation = booking.participations?.find((p) => p.userId === user.id);
            const attending = booking.participations?.filter((p) => p.status === "ATTENDING").length ?? 0;

            return (
              <div key={booking.id} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.title}</h3>
                      <div className="text-sm opacity-70">
                        {new Date(booking.startTime).toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" })}
                        {" "}
                        {new Date(booking.startTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(booking.endTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="badge badge-sm badge-outline">{booking.type === "TRAINING" ? "Træning" : "Kamp"}</span>
                        <span className="ml-2 text-xs opacity-60">👥 {attending} tilmeldt</span>
                      </div>
                    </div>
                    {booking.type === "TRAINING" && (
                      <div className="flex gap-2">
                        <button
                          className={`btn btn-sm ${myParticipation?.status === "ATTENDING" ? "btn-success" : "btn-outline"}`}
                          onClick={() => handleParticipation(booking.id, "ATTENDING")}
                        >
                          Deltager
                        </button>
                        <button
                          className={`btn btn-sm ${myParticipation?.status === "NOT_ATTENDING" ? "btn-error" : "btn-outline"}`}
                          onClick={() => handleParticipation(booking.id, "NOT_ATTENDING")}
                        >
                          Kan ikke
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
