import { prisma } from "../../lib/prisma";
import { createTeam } from "../../actions/team";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, bookings: true } } },
  });

  return (
    <section className="space-y-4 rounded-box border border-base-300 bg-base-100 p-6">
      <h1 className="text-2xl font-semibold">Hold</h1>

      <form action={createTeam} className="grid gap-3 rounded-box border border-base-300 p-4 md:grid-cols-2">
        <label className="form-control">
          <span className="label-text mb-1">Holdnavn</span>
          <input name="name" type="text" className="input input-bordered" required />
        </label>

        <label className="form-control">
          <span className="label-text mb-1">Klubfarve</span>
          <input name="clubColor" type="color" defaultValue="#1D3557" className="input input-bordered h-12 w-20" required />
        </label>

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary btn-sm">Opret hold</button>
        </div>
      </form>

      {teams.length === 0 ? (
        <p className="text-base-content/80">Ingen hold fundet endnu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Farve</th>
                <th>Navn</th>
                <th>Medlemmer</th>
                <th>Bookinger</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: team.clubColor }} />
                  </td>
                  <td>{team.name}</td>
                  <td>{team._count.users}</td>
                  <td>{team._count.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
