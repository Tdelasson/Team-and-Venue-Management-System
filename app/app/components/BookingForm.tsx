"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { PitchVisual } from "./PitchVisual";
import type { BookingWithRelations, PitchOption } from "@/lib/types";

interface BookingFormProps {
  booking?: BookingWithRelations;
}

export function BookingForm({ booking }: BookingFormProps) {
  const router = useRouter();
  const isEdit = !!booking;

  const [type, setType] = useState(booking?.type || "TRAINING");
  const [title, setTitle] = useState(booking?.title || "");
  const [pitchOption, setPitchOption] = useState<PitchOption>(
    (booking?.pitchOption as PitchOption) || "FULL"
  );
  const [date, setDate] = useState(() => {
    if (booking) return new Date(booking.startTime).toISOString().split("T")[0];
    return "";
  });
  const [startTime, setStartTime] = useState(() => {
    if (booking) {
      const d = new Date(booking.startTime);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "18:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (booking) {
      const d = new Date(booking.endTime);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "20:00";
  });
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (type === "MATCH" && pitchOption !== "FULL") {
    setPitchOption("FULL");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setError("Starttid skal være før sluttid");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        const res = await apiFetch(`/api/bookings/${booking.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            pitchOption,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Fejl ved opdatering");
          setLoading(false);
          return;
        }
        router.push(`/bookings/${booking.id}`);
      } else if (recurring && type === "TRAINING") {
        const res = await apiFetch("/api/bookings/recurring", {
          method: "POST",
          body: JSON.stringify({
            title,
            pitchOption,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            weeks,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Fejl ved oprettelse");
          setLoading(false);
          return;
        }
        if (data.conflicts?.length > 0) {
          setSuccess(
            `${data.created.length} af ${weeks} bookinger oprettet. ${data.conflicts.length} havde konflikter.`
          );
        } else {
          router.push("/bookings");
        }
      } else {
        const res = await apiFetch("/api/bookings", {
          method: "POST",
          body: JSON.stringify({
            type,
            title,
            pitchOption,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Fejl ved oprettelse");
          setLoading(false);
          return;
        }
        router.push("/bookings");
      }
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!isEdit && (
        <div className="form-control">
          <label className="label"><span className="label-text font-semibold">Type</span></label>
          <div className="flex gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="type"
                className="radio radio-primary"
                value="TRAINING"
                checked={type === "TRAINING"}
                onChange={() => setType("TRAINING")}
              />
              <span>Træning</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="type"
                className="radio radio-primary"
                value="MATCH"
                checked={type === "MATCH"}
                onChange={() => setType("MATCH")}
              />
              <span>Kamp</span>
            </label>
          </div>
        </div>
      )}

      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Titel</span></label>
        <input
          type="text"
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "MATCH" ? "F.eks. ITU vs CBS" : "F.eks. Torsdagstræning"}
          required
        />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Banevalg</span></label>
        <div className="flex gap-4">
          {(["FULL", "HALF_A", "HALF_B"] as const).map((opt) => (
            <label key={opt} className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="pitch"
                className="radio radio-primary"
                value={opt}
                checked={pitchOption === opt}
                onChange={() => setPitchOption(opt)}
                disabled={type === "MATCH" && opt !== "FULL"}
              />
              <span>{opt === "FULL" ? "Hel bane" : opt === "HALF_A" ? "Halv A" : "Halv B"}</span>
            </label>
          ))}
        </div>
        <div className="mt-2">
          <PitchVisual pitchOption={pitchOption} size="md" />
        </div>
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Dato</span></label>
        <input
          type="date"
          className="input input-bordered"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text font-semibold">Starttid</span></label>
          <input
            type="time"
            className="input input-bordered"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            step="1800"
            required
          />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text font-semibold">Sluttid</span></label>
          <input
            type="time"
            className="input input-bordered"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            step="1800"
            required
          />
        </div>
      </div>

      {!isEdit && type === "TRAINING" && (
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            <span className="label-text font-semibold">Gentag ugentligt</span>
          </label>
          {recurring && (
            <div className="ml-8 mt-2">
              <label className="label"><span className="label-text">Antal uger</span></label>
              <input
                type="number"
                className="input input-bordered input-sm w-24"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm"></span>}
          {isEdit ? "Gem ændringer" : "Opret booking"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Annuller
        </button>
      </div>
    </form>
  );
}
