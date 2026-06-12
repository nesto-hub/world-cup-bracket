type GroupCardProps = {
  groupName: string;
  teams: string[];
  rankings: string[];
  onChangeRanking: (groupName: string, position: number, team: string) => void;
};

export default function GroupCard({
  groupName,
  teams,
  rankings,
  onChangeRanking,
}: GroupCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Group {groupName}</h2>

      <div className="mt-4 space-y-3">
        {[0, 1, 2, 3].map((position) => {
          const selectedTeams = rankings.filter((_, index) => index !== position);

          return (
            <div key={position} className="flex items-center gap-3">
              <span className="w-24 font-semibold">
                {position + 1} place
              </span>

              <select
                className="w-full rounded-lg border p-3"
                value={rankings[position] || ""}
                onChange={(e) =>
                  onChangeRanking(groupName, position, e.target.value)
                }
              >
                <option value="">Select team</option>

                {teams.map((team) => (
                  <option
                    key={team}
                    value={team}
                    disabled={selectedTeams.includes(team)}
                  >
                    {team}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}