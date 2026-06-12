type Team = {
  name: string;
  points: number;
};

export default function GroupTable({
  teams,
}: {
  teams: Team[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Group A
      </h2>

      <table className="border">
        <thead>
          <tr>
            <th className="px-4">Team</th>
            <th className="px-4">Pts</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team.name}>
              <td className="px-4">{team.name}</td>
              <td className="px-4">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}