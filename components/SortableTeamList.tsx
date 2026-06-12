"use client";

import { useState } from "react";
import { countryCodes } from "@/data/countryCodes";

function Flag({ team }: { team: string }) {
  const code = countryCodes[team];

  if (!code) return <span className="h-5 w-7 rounded bg-slate-700" />;

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={`${team} flag`}
      className="h-5 w-7 rounded object-cover shadow"
      draggable={false}
    />
  );
}

type Props = {
  teams: string[];
  onChange: (teams: string[]) => void;
};

export default function SortableTeamList({ teams, onChange }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  function handleTeamClick(team: string) {
    if (!selectedTeam) {
      setSelectedTeam(team);
      return;
    }

    if (selectedTeam === team) {
      setSelectedTeam(null);
      return;
    }

    const firstIndex = teams.indexOf(selectedTeam);
    const secondIndex = teams.indexOf(team);

    const updatedTeams = [...teams];
    updatedTeams[firstIndex] = team;
    updatedTeams[secondIndex] = selectedTeam;

    onChange(updatedTeams);
    setSelectedTeam(null);
  }

  return (
    <div className="space-y-3">
      {teams.map((team, index) => {
        const isSelected = selectedTeam === team;

        return (
          <button
            key={team}
            type="button"
            onClick={() => handleTeamClick(team)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left font-bold transition ${
              isSelected
                ? "border-lime-400 bg-lime-400 text-black"
                : "border-white/10 bg-black/40 text-white hover:bg-white/10"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                  index < 2
                    ? "bg-lime-400 text-black"
                    : index === 2
                    ? "bg-yellow-300 text-black"
                    : "bg-slate-700 text-white"
                }`}
              >
                {index + 1}
              </span>

              <Flag team={team} />

              <span className="truncate">{team}</span>
            </div>

            <span className="text-xs font-black opacity-70">
              {isSelected ? "Choose swap" : "Tap"}
            </span>
          </button>
        );
      })}

      <p className="text-xs text-slate-400">
        Tap two teams to switch their positions.
      </p>
    </div>
  );
}