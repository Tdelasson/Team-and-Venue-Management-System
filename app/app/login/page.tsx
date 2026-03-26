"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

const roleBadge: Record<string, string> = {
  ADMIN: "badge-error",
  COACH: "badge-warning",
  PLAYER: "badge-info",
  SPECTATOR: "badge-success",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  COACH: "Træner",
  PLAYER: "Spiller",
  SPECTATOR: "Tilskuer",
};

const roleDescription: Record<string, string> = {
  ADMIN: "Godkend bookinger og administrer systemet",
  COACH: "Opret og administrer bookinger for dit hold",
  PLAYER: "Se kalender og tilmeld dig træninger",
  SPECTATOR: "Se kampkalender og vis interesse",
};

export default function LoginPage() {
  const { users, setUser } = useAuth();
  const router = useRouter();

  const grouped = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<string, typeof users>);

  const handleSelect = (user: (typeof users)[0]) => {
    setUser(user);
    router.push("/");
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">Log ind</h1>
      <p className="text-base-content/70 mb-6">Vælg en bruger for at logge ind (mock-system).</p>

      <div className="space-y-6">
        {(["ADMIN", "COACH", "PLAYER", "SPECTATOR"] as const).map((role) => (
          <div key={role}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${roleBadge[role]}`}>{roleLabel[role]}</span>
              <span className="text-sm opacity-60">{roleDescription[role]}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {grouped[role]?.map((u) => (
                <button
                  key={u.id}
                  className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer text-left"
                  onClick={() => handleSelect(u)}
                >
                  <div className="card-body p-4">
                    <h3 className="font-semibold">{u.name}</h3>
                    <p className="text-sm opacity-60">{u.email}</p>
                    {u.teamName && (
                      <span className="badge badge-sm badge-outline mt-1">{u.teamName}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
