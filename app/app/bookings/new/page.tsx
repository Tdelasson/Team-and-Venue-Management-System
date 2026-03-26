"use client";

import { useAuth } from "../../components/AuthProvider";
import { BookingForm } from "../../components/BookingForm";

export default function NewBookingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user || user.role !== "COACH") {
    return (
      <div className="alert alert-warning">
        <span>Kun trænere kan oprette bookinger. Log ind som træner.</span>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Opret ny booking</h1>
      <div className="card bg-base-100 shadow-sm border border-base-300 p-6">
        <BookingForm />
      </div>
    </section>
  );
}
