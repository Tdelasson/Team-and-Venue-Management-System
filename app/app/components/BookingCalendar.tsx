"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { BookingWithRelations } from "@/lib/types";

const HOURS_START = 8;
const HOURS_END = 22;
const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const mStr = monday.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  const sStr = sunday.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
  return `${mStr} – ${sStr}`;
}

interface BookingCalendarProps {
  teamId?: string;
  showFilters?: boolean;
}

export function BookingCalendar({ teamId, showFilters = true }: BookingCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState(teamId || "");
  const [filterType, setFilterType] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string; clubColor: string }[]>([]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const from = weekStart.toISOString();
    const to = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let url = `/api/bookings?status=APPROVED&from=${from}&to=${to}`;
    if (filterTeam) url += `&teamId=${filterTeam}`;
    if (filterType) url += `&type=${filterType}`;

    const res = await apiFetch(url);
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  }, [weekStart, filterTeam, filterType]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (showFilters) {
      apiFetch("/api/teams").then((r) => r.json()).then(setTeams);
    }
  }, [showFilters]);

  useEffect(() => {
    if (teamId) setFilterTeam(teamId);
  }, [teamId]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const today = () => setWeekStart(getMonday(new Date()));

  const totalSlots = (HOURS_END - HOURS_START) * 2;
  const slotHeight = 28;

  function getBookingStyle(booking: BookingWithRelations, dayStart: Date) {
    const bStart = new Date(booking.startTime);
    const bEnd = new Date(booking.endTime);
    const dayMs = dayStart.getTime();

    const startMinutes = Math.max(0, (bStart.getTime() - dayMs) / 60000 - HOURS_START * 60);
    const endMinutes = Math.min((HOURS_END - HOURS_START) * 60, (bEnd.getTime() - dayMs) / 60000 - HOURS_START * 60);

    const top = (startMinutes / 30) * slotHeight;
    const height = Math.max(slotHeight, ((endMinutes - startMinutes) / 30) * slotHeight);

    let left = "0%";
    let width = "100%";
    if (booking.pitchOption === "HALF_A") {
      left = "0%";
      width = "49%";
    } else if (booking.pitchOption === "HALF_B") {
      left = "51%";
      width = "49%";
    }

    return { top: `${top}px`, height: `${height}px`, left, width };
  }

  function getDayDate(dayIndex: number): Date {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  }

  function getBookingsForDay(dayIndex: number): BookingWithRelations[] {
    const dayStart = getDayDate(dayIndex);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return bookings.filter((b) => {
      const s = new Date(b.startTime);
      return s >= dayStart && s < dayEnd;
    });
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-outline" onClick={prevWeek}>◀</button>
          <button className="btn btn-sm btn-outline" onClick={today}>I dag</button>
          <button className="btn btn-sm btn-outline" onClick={nextWeek}>▶</button>
          <span className="font-semibold text-sm">{formatWeekRange(weekStart)}</span>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <select
              className="select select-sm select-bordered"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <option value="">Alle hold</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              className="select select-sm select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Alle typer</option>
              <option value="TRAINING">Træning</option>
              <option value="MATCH">Kamp</option>
            </select>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-base-300 rounded-lg bg-base-100">
          <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", minWidth: "800px" }}>
            {/* Header row */}
            <div className="bg-base-200 border-b border-base-300 p-2 text-xs font-semibold text-center"></div>
            {DAYS.map((day, i) => {
              const d = getDayDate(i);
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day}
                  className={`bg-base-200 border-b border-l border-base-300 p-2 text-center text-xs font-semibold ${isToday ? "bg-primary/10 text-primary" : ""}`}
                >
                  {day} {d.getDate()}/{d.getMonth() + 1}
                </div>
              );
            })}

            {/* Time slots column + day columns */}
            <div className="relative" style={{ height: totalSlots * slotHeight }}>
              {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => (
                <div
                  key={i}
                  className="absolute right-0 left-0 border-b border-base-300 text-xs text-right pr-2 flex items-start pt-0.5"
                  style={{ top: i * 2 * slotHeight, height: slotHeight * 2 }}
                >
                  {(HOURS_START + i).toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const dayBookings = getBookingsForDay(dayIndex);
              const dayStart = getDayDate(dayIndex);

              return (
                <div
                  key={dayIndex}
                  className="relative border-l border-base-300"
                  style={{ height: totalSlots * slotHeight }}
                >
                  {/* Hour grid lines */}
                  {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-b border-base-200"
                      style={{ top: i * 2 * slotHeight + slotHeight * 2 - 1 }}
                    />
                  ))}

                  {/* Booking blocks */}
                  {dayBookings.map((booking) => {
                    const style = getBookingStyle(booking, dayStart);
                    return (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className="absolute rounded px-1 py-0.5 text-xs overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-l-3"
                        style={{
                          ...style,
                          backgroundColor: `${booking.team.clubColor}22`,
                          borderLeftColor: booking.team.clubColor,
                          color: booking.team.clubColor,
                        }}
                      >
                        <div className="font-semibold truncate" style={{ color: "inherit" }}>
                          {booking.title}
                        </div>
                        <div className="truncate opacity-75">
                          {new Date(booking.startTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {new Date(booking.endTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {booking.pitchOption !== "FULL" && (
                          <div className="truncate opacity-60">
                            {booking.pitchOption === "HALF_A" ? "Bane A" : "Bane B"}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
