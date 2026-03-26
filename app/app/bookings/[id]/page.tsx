"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { PitchVisual } from "../../components/PitchVisual";
import { apiFetch } from "@/lib/api";
import type { BookingWithRelations, PitchOption } from "@/lib/types";
import Link from "next/link";

const statusBadge: Record<string, string> = {
  PENDING: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
  CANCELLED: "badge-ghost",
  CONDUCTED: "badge-info",
};

const statusLabel: Record<string, string> = {
  PENDING: "Ventende",
  APPROVED: "Godkendt",
  REJECTED: "Afvist",
  CANCELLED: "Annulleret",
  CONDUCTED: "Gennemført",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = async () => {
    const res = await apiFetch(`/api/bookings/${id}`);
    if (res.ok) {
      setBooking(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    const res = await apiFetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchBooking();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("Er du sikker på at du vil annullere denne booking?")) return;
    setActionLoading(true);
    const res = await apiFetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/bookings");
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setActionLoading(false);
  };

  const handleParticipation = async (status: "ATTENDING" | "NOT_ATTENDING") => {
    setActionLoading(true);
    const res = await apiFetch(`/api/bookings/${id}/participate`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchBooking();
    }
    setActionLoading(false);
  };

  const handleInterest = async () => {
    setActionLoading(true);
    await apiFetch(`/api/bookings/${id}/interest`, { method: "POST" });
    await fetchBooking();
    setActionLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!booking) {
    return <div className="alert alert-error"><span>Booking ikke fundet.</span></div>;
  }

  const isCreator = user?.id === booking.createdByUserId;
  const isAdmin = user?.role === "ADMIN";
  const isPlayer = user?.role === "PLAYER" && user.teamId === booking.teamId;
  const isSpectator = user?.role === "SPECTATOR";
  const attending = booking.participations?.filter((p) => p.status === "ATTENDING") ?? [];
  const myParticipation = booking.participations?.find((p) => p.userId === user?.id);
  const myInterest = booking.spectatorInterests?.some((s) => s.userId === user?.id);
  const isPast = new Date(booking.endTime) < new Date();

  return (
    <section className="max-w-2xl">
      <div className="mb-4">
        <Link href="/bookings" className="btn btn-ghost btn-sm">← Tilbage til kalender</Link>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="card-title text-2xl">{booking.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="badge" style={{ backgroundColor: booking.team.clubColor, color: "white" }}>
                  {booking.team.name}
                </span>
                <span className="badge badge-outline">
                  {booking.type === "TRAINING" ? "Træning" : "Kamp"}
                </span>
                <span className={`badge ${statusBadge[booking.status]}`}>
                  {statusLabel[booking.status]}
                </span>
              </div>
            </div>
            <PitchVisual pitchOption={booking.pitchOption as PitchOption} size="md" />
          </div>

          <div className="divider"></div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Dato:</span>{" "}
              {new Date(booking.startTime).toLocaleDateString("da-DK", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </div>
            <div>
              <span className="font-semibold">Tid:</span>{" "}
              {new Date(booking.startTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {new Date(booking.endTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div>
              <span className="font-semibold">Bane:</span>{" "}
              {booking.pitchOption === "FULL" ? "Hel bane" : booking.pitchOption === "HALF_A" ? "Halv bane A" : "Halv bane B"}
            </div>
            <div>
              <span className="font-semibold">Oprettet af:</span> {booking.createdBy.name}
            </div>
          </div>

          {booking.recurringGroupId && (
            <div className="mt-2">
              <span className="badge badge-outline badge-sm">Del af ugentlig serie</span>
            </div>
          )}

          {/* Participation section for training */}
          {booking.type === "TRAINING" && booking.status === "APPROVED" && (
            <>
              <div className="divider"></div>
              <div>
                <h3 className="font-semibold mb-2">Tilmelding ({attending.length} deltager)</h3>
                {booking.participations && booking.participations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {booking.participations.map((p) => (
                      <span
                        key={p.userId}
                        className={`badge ${p.status === "ATTENDING" ? "badge-success" : "badge-ghost"}`}
                      >
                        {p.user.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm opacity-60">Ingen tilmeldte endnu</p>
                )}

                {isPlayer && (
                  <div className="flex gap-2 mt-3">
                    <button
                      className={`btn btn-sm ${myParticipation?.status === "ATTENDING" ? "btn-success" : "btn-outline"}`}
                      onClick={() => handleParticipation("ATTENDING")}
                      disabled={actionLoading}
                    >
                      Deltager
                    </button>
                    <button
                      className={`btn btn-sm ${myParticipation?.status === "NOT_ATTENDING" ? "btn-error" : "btn-outline"}`}
                      onClick={() => handleParticipation("NOT_ATTENDING")}
                      disabled={actionLoading}
                    >
                      Kan ikke
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Spectator interest for matches */}
          {booking.type === "MATCH" && booking.status === "APPROVED" && (
            <>
              <div className="divider"></div>
              <div>
                <h3 className="font-semibold mb-2">
                  Tilskuerinteresse ({booking.spectatorInterests?.length ?? 0} interesserede)
                </h3>
                {isSpectator && (
                  <button
                    className={`btn btn-sm ${myInterest ? "btn-accent" : "btn-outline"}`}
                    onClick={handleInterest}
                    disabled={actionLoading}
                  >
                    {myInterest ? "★ Fjern interesse" : "☆ Vis interesse"}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="divider"></div>
          <div className="flex flex-wrap gap-2">
            {/* Admin actions */}
            {isAdmin && booking.status === "PENDING" && (
              <>
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange("APPROVED")} disabled={actionLoading}>
                  Godkend
                </button>
                <button className="btn btn-error btn-sm" onClick={() => handleStatusChange("REJECTED")} disabled={actionLoading}>
                  Afvis
                </button>
              </>
            )}

            {/* Coach actions */}
            {isCreator && ["PENDING", "APPROVED"].includes(booking.status) && (
              <>
                <Link href={`/bookings/${id}/edit`} className="btn btn-outline btn-sm">
                  Rediger
                </Link>
                <button className="btn btn-error btn-sm btn-outline" onClick={handleCancel} disabled={actionLoading}>
                  Annuller
                </button>
              </>
            )}

            {isCreator && booking.status === "APPROVED" && booking.type === "TRAINING" && isPast && (
              <button className="btn btn-info btn-sm" onClick={() => handleStatusChange("CONDUCTED")} disabled={actionLoading}>
                Markér som gennemført
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
