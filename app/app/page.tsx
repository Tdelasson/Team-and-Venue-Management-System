"use client";

import { FormEvent, useMemo, useState } from "react";

type Role = "admin" | "trainer" | "player" | "spectator";
type EventType = "training" | "match";
type EventStatus = "approved" | "pending" | "rejected";

type Team = {
  id: string;
  name: string;
  institute: string;
};

type VenueEvent = {
  id: string;
  title: string;
  type: EventType;
  teamId: string;
  date: string;
  time: string;
  status: EventStatus;
  requestedBy: string;
  participants: string[];
};

type FixedTrainingRequest = {
  id: string;
  teamId: string;
  days: string[];
  time: string;
  sessionsPerWeek: 1 | 2;
  status: EventStatus;
  requestedBy: string;
};

type Session = {
  name: string;
  role: Role;
  institute: string;
  teamId: string;
};

const teams: Team[] = [
  { id: "cs-a", name: "CS Wolves", institute: "Computer Science" },
  { id: "eng-a", name: "Engineering Eagles", institute: "Engineering" },
  { id: "bio-a", name: "Bio Bears", institute: "Biology" },
  { id: "club-a", name: "City Club", institute: "City Sports Club" },
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialEvents: VenueEvent[] = [
  {
    id: "evt-1",
    title: "CS Wolves Training",
    type: "training",
    teamId: "cs-a",
    date: "2026-03-30",
    time: "18:00",
    status: "approved",
    requestedBy: "Mikkel",
    participants: [],
  },
  {
    id: "evt-2",
    title: "Engineering Eagles vs Bio Bears",
    type: "match",
    teamId: "eng-a",
    date: "2026-03-31",
    time: "19:30",
    status: "approved",
    requestedBy: "Sara",
    participants: [],
  },
  {
    id: "evt-3",
    title: "City Club Training",
    type: "training",
    teamId: "club-a",
    date: "2026-04-01",
    time: "18:00",
    status: "pending",
    requestedBy: "Coach Jonas",
    participants: [],
  },
];

const initialFixedRequests: FixedTrainingRequest[] = [
  {
    id: "fix-1",
    teamId: "bio-a",
    days: ["Tuesday", "Thursday"],
    time: "17:30",
    sessionsPerWeek: 2,
    status: "pending",
    requestedBy: "Coach Lea",
  },
];

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<VenueEvent[]>(initialEvents);
  const [fixedRequests, setFixedRequests] = useState<FixedTrainingRequest[]>(initialFixedRequests);
  const [loginForm, setLoginForm] = useState({ name: "", role: "player" as Role, institute: teams[0].institute, teamId: teams[0].id });
  const [bookingForm, setBookingForm] = useState({ type: "training" as EventType, date: "", time: "", title: "", duplicateTraining: false });
  const [fixedForm, setFixedForm] = useState({ days: ["Monday"], time: "", sessionsPerWeek: 1 as 1 | 2 });

  const pendingEvents = useMemo(() => events.filter((event) => event.status === "pending"), [events]);
  const pendingFixed = useMemo(() => fixedRequests.filter((request) => request.status === "pending"), [fixedRequests]);

  const slotCounts = useMemo(() => {
    const keyCount = new Map<string, number>();
    for (const event of events) {
      if (event.type !== "training") {
        continue;
      }
      const key = `${event.date}|${event.time}`;
      keyCount.set(key, (keyCount.get(key) ?? 0) + 1);
    }
    return keyCount;
  }, [events]);

  const scoreBoard = useMemo(() => {
    const byInstitute = new Map<string, { trainings: number; matches: number }>();
    for (const team of teams) {
      if (!byInstitute.has(team.institute)) {
        byInstitute.set(team.institute, { trainings: 0, matches: 0 });
      }
    }
    for (const event of events) {
      if (event.status !== "approved") {
        continue;
      }
      const team = teams.find((item) => item.id === event.teamId);
      if (!team) {
        continue;
      }
      const current = byInstitute.get(team.institute);
      if (!current) {
        continue;
      }
      if (event.type === "training") {
        current.trainings += 1;
      } else {
        current.matches += 1;
      }
      byInstitute.set(team.institute, current);
    }
    return [...byInstitute.entries()].map(([institute, stats]) => ({
      institute,
      ...stats,
      total: stats.trainings + stats.matches,
    }));
  }, [events]);

  const visibleEvents = useMemo(() => {
    if (!session) {
      return [];
    }
    if (session.role === "admin") {
      return events;
    }
    return events.filter((event) => event.status === "approved" || event.teamId === session.teamId);
  }, [events, session]);

  const onLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSession({
      name: loginForm.name.trim() || "User",
      role: loginForm.role,
      institute: loginForm.institute,
      teamId: loginForm.teamId,
    });
  };

  const requestBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !bookingForm.date || !bookingForm.time) {
      return;
    }
    const bookingCount = bookingForm.type === "training" && bookingForm.duplicateTraining ? 2 : 1;
    const created = Array.from({ length: bookingCount }).map((_, index) => ({
      id: `${Date.now()}-${index}`,
      title:
        bookingForm.title.trim() ||
        `${session.institute} ${bookingForm.type === "training" ? "Training" : "Match"}`,
      type: bookingForm.type,
      teamId: session.teamId,
      date: bookingForm.date,
      time: bookingForm.time,
      status: "pending" as EventStatus,
      requestedBy: session.name,
      participants: [],
    }));
    setEvents((previous) => [...created, ...previous]);
    setBookingForm((previous) => ({ ...previous, title: "", date: "", time: "", duplicateTraining: false }));
  };

  const requestFixedTraining = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || fixedForm.days.length === 0 || !fixedForm.time) {
      return;
    }
    const request: FixedTrainingRequest = {
      id: `fix-${Date.now()}`,
      teamId: session.teamId,
      days: fixedForm.days,
      time: fixedForm.time,
      sessionsPerWeek: fixedForm.sessionsPerWeek,
      status: "pending",
      requestedBy: session.name,
    };
    setFixedRequests((previous) => [request, ...previous]);
    setFixedForm({ days: ["Monday"], time: "", sessionsPerWeek: 1 });
  };

  const setEventStatus = (id: string, status: Exclude<EventStatus, "pending">) => {
    setEvents((previous) => previous.map((event) => (event.id === id ? { ...event, status } : event)));
  };

  const setFixedStatus = (id: string, status: Exclude<EventStatus, "pending">) => {
    setFixedRequests((previous) => previous.map((item) => (item.id === id ? { ...item, status } : item)));
    if (status !== "approved") {
      return;
    }
    const approved = fixedRequests.find((item) => item.id === id);
    if (!approved) {
      return;
    }
    const toSchedule = approved.days.slice(0, approved.sessionsPerWeek);
    const recurringEvents = toSchedule.map((day, index) => ({
      id: `rec-${id}-${index}`,
      title: `Fast træning (${day})`,
      type: "training" as EventType,
      teamId: approved.teamId,
      date: `Weekly ${day}`,
      time: approved.time,
      status: "approved" as EventStatus,
      requestedBy: approved.requestedBy,
      participants: [],
    }));
    setEvents((previous) => [...recurringEvents, ...previous]);
  };

  const toggleParticipation = (id: string) => {
    if (!session) {
      return;
    }
    setEvents((previous) =>
      previous.map((event) => {
        if (event.id !== id) {
          return event;
        }
        const joined = event.participants.includes(session.name);
        return {
          ...event,
          participants: joined
            ? event.participants.filter((participant) => participant !== session.name)
            : [...event.participants, session.name],
        };
      }),
    );
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-base-200 p-6">
        <div className="mx-auto max-w-2xl card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl">Banebookingssystem prototype</h1>
            <p>Login som institut/uddannelse/klub og vælg rolle.</p>
            <form onSubmit={onLogin} className="grid gap-4 sm:grid-cols-2">
              <label className="form-control sm:col-span-2">
                <span className="label-text">Navn</span>
                <input
                  className="input input-bordered"
                  value={loginForm.name}
                  onChange={(event) => setLoginForm((previous) => ({ ...previous, name: event.target.value }))}
                  required
                />
              </label>
              <label className="form-control">
                <span className="label-text">Rolle</span>
                <select
                  className="select select-bordered"
                  value={loginForm.role}
                  onChange={(event) => setLoginForm((previous) => ({ ...previous, role: event.target.value as Role }))}
                >
                  <option value="admin">Admin</option>
                  <option value="trainer">Træner</option>
                  <option value="player">Spiller</option>
                  <option value="spectator">Spectator</option>
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">Hold</span>
                <select
                  className="select select-bordered"
                  value={loginForm.teamId}
                  onChange={(event) => {
                    const teamId = event.target.value;
                    const team = teams.find((item) => item.id === teamId);
                    setLoginForm((previous) => ({
                      ...previous,
                      teamId,
                      institute: team?.institute ?? previous.institute,
                    }));
                  }}
                >
                  {teams.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control sm:col-span-2">
                <span className="label-text">Institut / uddannelse / klub</span>
                <input className="input input-bordered" value={loginForm.institute} readOnly />
              </label>
              <button className="btn btn-primary sm:col-span-2" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="card bg-base-100 shadow-sm">
          <div className="card-body md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="card-title">Banebookingssystem</h1>
              <p>
                Logget ind som <strong>{session.name}</strong> ({session.role}) - {session.institute}
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => setSession(null)}>
              Log ud
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-sm lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title">Oversigt over events</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm md:table-md">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Hold</th>
                      <th>Dato</th>
                      <th>Tid</th>
                      <th>Status</th>
                      <th>Deltagere</th>
                      <th>Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEvents.map((event) => {
                      const team = teams.find((item) => item.id === event.teamId);
                      const slotKey = `${event.date}|${event.time}`;
                      const dualTraining = event.type === "training" && (slotCounts.get(slotKey) ?? 0) > 1;
                      const canJoin =
                        session.role === "player" || (session.role === "spectator" && event.type === "match");
                      const joined = event.participants.includes(session.name);

                      return (
                        <tr key={event.id}>
                          <td>
                            <span className={`badge ${event.type === "match" ? "badge-secondary" : "badge-primary"}`}>
                              {event.type}
                            </span>
                            {dualTraining ? <span className="badge badge-warning ml-2">2x training slot</span> : null}
                          </td>
                          <td>{team?.name}</td>
                          <td>{event.date}</td>
                          <td>{event.time}</td>
                          <td>
                            <span
                              className={`badge ${
                                event.status === "approved"
                                  ? "badge-success"
                                  : event.status === "pending"
                                    ? "badge-warning"
                                    : "badge-error"
                              }`}
                            >
                              {event.status}
                            </span>
                          </td>
                          <td>{event.participants.length}</td>
                          <td>
                            {canJoin && event.status === "approved" ? (
                              <button className="btn btn-xs btn-outline" onClick={() => toggleParticipation(event.id)}>
                                {joined ? "Aflys" : "Deltag"}
                              </button>
                            ) : (
                              <span className="text-xs opacity-60">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Scoreboard</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Institut/klub</th>
                      <th>Kampe</th>
                      <th>Træninger</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreBoard.map((row) => (
                      <tr key={row.institute}>
                        <td>{row.institute}</td>
                        <td>{row.matches}</td>
                        <td>{row.trainings}</td>
                        <td>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {session.role === "trainer" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Book kamp eller træning (request)</h3>
                <form onSubmit={requestBooking} className="grid gap-3">
                  <label className="form-control">
                    <span className="label-text">Type</span>
                    <select
                      className="select select-bordered"
                      value={bookingForm.type}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          type: event.target.value as EventType,
                        }))
                      }
                    >
                      <option value="training">Training</option>
                      <option value="match">Match</option>
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">Titel</span>
                    <input
                      className="input input-bordered"
                      value={bookingForm.title}
                      onChange={(event) =>
                        setBookingForm((previous) => ({ ...previous, title: event.target.value }))
                      }
                      placeholder="Fx Semifinale"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text">Dato</span>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={bookingForm.date}
                        onChange={(event) =>
                          setBookingForm((previous) => ({ ...previous, date: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text">Tid</span>
                      <input
                        type="time"
                        className="input input-bordered"
                        value={bookingForm.time}
                        onChange={(event) =>
                          setBookingForm((previous) => ({ ...previous, time: event.target.value }))
                        }
                        required
                      />
                    </label>
                  </div>
                  {bookingForm.type === "training" ? (
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={bookingForm.duplicateTraining}
                        onChange={(event) =>
                          setBookingForm((previous) => ({
                            ...previous,
                            duplicateTraining: event.target.checked,
                          }))
                        }
                      />
                      <span className="label-text">Book 2 træninger på samme tid</span>
                    </label>
                  ) : null}
                  <button className="btn btn-primary" type="submit">
                    Send request
                  </button>
                </form>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Anmod fast træningsdage</h3>
                <form onSubmit={requestFixedTraining} className="grid gap-3">
                  <label className="form-control">
                    <span className="label-text">1-2 gange om ugen</span>
                    <select
                      className="select select-bordered"
                      value={fixedForm.sessionsPerWeek}
                      onChange={(event) =>
                        setFixedForm((previous) => ({
                          ...previous,
                          sessionsPerWeek: Number(event.target.value) as 1 | 2,
                        }))
                      }
                    >
                      <option value={1}>1 gang</option>
                      <option value={2}>2 gange</option>
                    </select>
                  </label>
                  <fieldset className="form-control">
                    <legend className="label-text">Vælg træningsdage</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {weekdays.map((day) => {
                        const checked = fixedForm.days.includes(day);
                        return (
                          <label key={day} className="label cursor-pointer justify-start gap-2">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={checked}
                              onChange={(event) => {
                                setFixedForm((previous) => {
                                  if (event.target.checked) {
                                    return { ...previous, days: [...previous.days, day] };
                                  }
                                  return {
                                    ...previous,
                                    days: previous.days.filter((selected) => selected !== day),
                                  };
                                });
                              }}
                            />
                            <span className="label-text">{day}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <label className="form-control">
                    <span className="label-text">Tid</span>
                    <input
                      type="time"
                      className="input input-bordered"
                      value={fixedForm.time}
                      onChange={(event) =>
                        setFixedForm((previous) => ({ ...previous, time: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <button className="btn btn-primary" type="submit">
                    Send fast træning request
                  </button>
                </form>
              </div>
            </div>
          </section>
        ) : null}

        {session.role === "admin" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Ventende bane-booking requests</h3>
                <div className="space-y-3">
                  {pendingEvents.length === 0 ? <p>Ingen ventende requests.</p> : null}
                  {pendingEvents.map((event) => {
                    const team = teams.find((item) => item.id === event.teamId);
                    return (
                      <div key={event.id} className="rounded-lg border border-base-300 p-3">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm opacity-80">
                          {team?.name} - {event.date} {event.time} ({event.type})
                        </p>
                        <p className="text-sm opacity-80">Requested by: {event.requestedBy}</p>
                        <div className="mt-2 flex gap-2">
                          <button className="btn btn-xs btn-success" onClick={() => setEventStatus(event.id, "approved")}>Approve</button>
                          <button className="btn btn-xs btn-error" onClick={() => setEventStatus(event.id, "rejected")}>Reject</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Ventende faste træningsanmodninger</h3>
                <div className="space-y-3">
                  {pendingFixed.length === 0 ? <p>Ingen ventende faste requests.</p> : null}
                  {pendingFixed.map((request) => {
                    const team = teams.find((item) => item.id === request.teamId);
                    return (
                      <div key={request.id} className="rounded-lg border border-base-300 p-3">
                        <p className="font-medium">{team?.name}</p>
                        <p className="text-sm opacity-80">
                          {request.days.join(", ")} - {request.time} ({request.sessionsPerWeek}x ugentligt)
                        </p>
                        <p className="text-sm opacity-80">Requested by: {request.requestedBy}</p>
                        <div className="mt-2 flex gap-2">
                          <button className="btn btn-xs btn-success" onClick={() => setFixedStatus(request.id, "approved")}>Approve</button>
                          <button className="btn btn-xs btn-error" onClick={() => setFixedStatus(request.id, "rejected")}>Reject</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
