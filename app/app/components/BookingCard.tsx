"use client";

import Link from "next/link";
import type { BookingWithRelations } from "@/lib/types";
import { PitchVisual } from "./PitchVisual";

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

const typeLabel: Record<string, string> = {
  TRAINING: "Træning",
  MATCH: "Kamp",
};

const pitchLabel: Record<string, string> = {
  FULL: "Hel bane",
  HALF_A: "Halv bane A",
  HALF_B: "Halv bane B",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

interface BookingCardProps {
  booking: BookingWithRelations;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function BookingCard({ booking, actions, compact = false }: BookingCardProps) {
  const start = formatDateTime(booking.startTime);
  const end = formatDateTime(booking.endTime);
  const attending = booking.participations?.filter((p) => p.status === "ATTENDING").length ?? 0;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/bookings/${booking.id}`} className="hover:underline">
              <h3 className="card-title text-base">{booking.title}</h3>
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="badge badge-sm"
                style={{ backgroundColor: booking.team.clubColor, color: "white" }}
              >
                {booking.team.name}
              </span>
              <span className="badge badge-sm badge-outline">{typeLabel[booking.type]}</span>
              <span className={`badge badge-sm ${statusBadge[booking.status]}`}>
                {statusLabel[booking.status]}
              </span>
            </div>
          </div>
          {!compact && <PitchVisual pitchOption={booking.pitchOption as "FULL" | "HALF_A" | "HALF_B"} size="sm" />}
        </div>

        <div className="flex items-center gap-4 text-sm opacity-70 mt-2">
          <span>📅 {start.date}</span>
          <span>🕐 {start.time} – {end.time}</span>
          <span>{pitchLabel[booking.pitchOption]}</span>
        </div>

        {!compact && (
          <div className="flex items-center gap-4 text-sm mt-1">
            {booking.type === "TRAINING" && (
              <span>👥 {attending} tilmeldt</span>
            )}
            {booking.type === "MATCH" && booking.spectatorInterests && (
              <span>👀 {booking.spectatorInterests.length} interesserede</span>
            )}
            {booking.recurringGroupId && (
              <span className="badge badge-xs badge-outline">Ugentlig serie</span>
            )}
          </div>
        )}

        {actions && <div className="card-actions justify-end mt-2">{actions}</div>}
      </div>
    </div>
  );
}
