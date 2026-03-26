"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Team {
  id: string;
  name: string;
  clubColor: string;
  _count: { users: number; bookings: number };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Hold</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: team.clubColor }}
                />
                <h2 className="card-title">{team.name}</h2>
              </div>
              <div className="flex gap-4 mt-2 text-sm opacity-70">
                <span>👥 {team._count.users} medlemmer</span>
                <span>📅 {team._count.bookings} bookinger</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
