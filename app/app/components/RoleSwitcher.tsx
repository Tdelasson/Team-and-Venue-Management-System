"use client";

import { useAuth } from "./AuthProvider";

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

export function RoleSwitcher() {
  const { user, users, setUser } = useAuth();

  const grouped = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<string, typeof users>);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="dropdown dropdown-top dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-2">
          {user ? (
            <>
              <span className={`badge badge-xs ${roleBadge[user.role]}`}></span>
              {user.name}
            </>
          ) : (
            "Gæst"
          )}
          <span className="text-xs opacity-60">▲</span>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-200 rounded-box w-64 p-2 shadow-lg mb-2 max-h-80 overflow-y-auto"
        >
          {(["ADMIN", "COACH", "PLAYER", "SPECTATOR"] as const).map((role) => (
            <li key={role}>
              <h2 className="menu-title flex items-center gap-2">
                <span className={`badge badge-xs ${roleBadge[role]}`}></span>
                {roleLabel[role]}
              </h2>
              <ul>
                {grouped[role]?.map((u) => (
                  <li key={u.id}>
                    <button
                      className={user?.id === u.id ? "active" : ""}
                      onClick={() => {
                        setUser(u);
                        (document.activeElement as HTMLElement)?.blur();
                      }}
                    >
                      {u.name}
                      {u.teamName && (
                        <span className="text-xs opacity-60">({u.teamName})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className="mt-2 border-t border-base-300 pt-2">
            <button
              className={!user ? "active" : ""}
              onClick={() => {
                setUser(null);
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              Log ud (Gæst)
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
