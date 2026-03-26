"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import { BookingForm } from "../../../components/BookingForm";
import { apiFetch } from "@/lib/api";
import type { BookingWithRelations } from "@/lib/types";

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setLoading(false);
      });
  }, [id]);

  if (loading || authLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!booking) {
    return <div className="alert alert-error"><span>Booking ikke fundet.</span></div>;
  }

  if (!user || user.id !== booking.createdByUserId) {
    return <div className="alert alert-warning"><span>Kun opretteren kan redigere denne booking.</span></div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Rediger booking</h1>
      <div className="card bg-base-100 shadow-sm border border-base-300 p-6">
        <BookingForm booking={booking} />
      </div>
    </section>
  );
}
