const roles = ["admin", "træner", "spiller", "spectator"];

export default function LoginPage() {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6">
      <h1 className="text-2xl font-semibold">Login prototype</h1>
      <p className="mt-2 text-base-content/80">
        Placeholder til integration af login-system pr. institut/uddannelse/klub.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span key={role} className="badge badge-outline">
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}
