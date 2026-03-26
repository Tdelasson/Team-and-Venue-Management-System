import { prisma } from "../../../lib/prisma";
import { createTeam } from "../../actions/team";

export default async function ScoreboardPage() {
  type TeamRow = {
    id: number;
    name: string;
    institute: string;
    numberOfPlayers: number;
    numberOfFans: number;
  };

  const teams = await prisma.$queryRaw<TeamRow[]>`
    SELECT id, name, institute, numberOfPlayers, numberOfFans
    FROM Team
    ORDER BY name ASC
  `;

  return (
    <section className="space-y-4 rounded-box border border-base-300 bg-base-100 p-6">
      <h1 className="text-2xl font-semibold">Hold</h1>

      <form action={createTeam} className="grid gap-3 rounded-box border border-base-300 p-4 md:grid-cols-2">
        <label className="form-control">
          <span className="label-text mb-1">Navn</span>
          <input name="name" type="text" className="input input-bordered" required />
        </label>

        <label className="form-control">
          <span className="label-text mb-1">Institut</span>
          <input name="institute" type="text" className="input input-bordered" required />
        </label>

        <label className="form-control">
          <span className="label-text mb-1">Antal spillere</span>
          <input name="numberOfPlayers" type="number" min={0} step={1} className="input input-bordered" required />
        </label>

        <label className="form-control">
          <span className="label-text mb-1">Antal fans</span>
          <input name="numberOfFans" type="number" min={0} step={1} className="input input-bordered" required />
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
                <th>Navn</th>
                <th>Institut</th>
                <th>Antal spillere</th>
                <th>Antal fans</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.name}</td>
                  <td>{team.institute}</td>
                  <td>{team.numberOfPlayers}</td>
                  <td>{team.numberOfFans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
