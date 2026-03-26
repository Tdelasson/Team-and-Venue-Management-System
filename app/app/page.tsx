import Link from "next/link";

const modules = [
  {
    title: "Login & Roller",
    description: "Role-based adgang for admin, trænere, spillere og spectators.",
    href: "/login",
  },
  {
    title: "Bane-events",
    description: "Oversigt over træninger og kampe med hurtig statusvisning.",
    href: "/events",
  },
  {
    title: "Booking-flow",
    description: "Trænere opretter forespørgsler, admin godkender/afviser.",
    href: "/bookings",
  },
  {
    title: "Fast træningsdage",
    description: "Opsæt faste slots 1-2 gange ugentligt for nye hold.",
    href: "/training-schedule",
  },
  {
    title: "Scoreboard",
    description: "Simpel placeringstavle på tværs af institutter og hold.",
    href: "/scoreboard",
  },
  {
    title: "Godkendelser",
    description: "Admin-hub til behandling af banereservationer.",
    href: "/requests",
  },
];

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-box border border-base-300 bg-base-100 p-6">
        <h1 className="text-3xl font-bold">Banebookingssystem – prototype struktur</h1>
        <p className="mt-2 text-base-content/80">
          Projektet er sat op til hurtig hackathon-udvikling med Next.js, Tailwind og DaisyUI.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="badge badge-primary">Next.js App Router</span>
          <span className="badge badge-secondary">Tailwind CSS</span>
          <span className="badge badge-accent">DaisyUI</span>
          <span className="badge badge-outline">Role-based klar</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article key={module.title} className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">{module.title}</h2>
              <p>{module.description}</p>
              <div className="card-actions justify-end">
                <Link href={module.href} className="btn btn-sm btn-outline">
                  Åbn modul
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
