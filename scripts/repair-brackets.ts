import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Slot = { label: string; team: string };

function isValidThirdPick(data: any, pick: Slot) {
  if (!pick?.label?.startsWith("3")) return true;

  const top8 = data.thirdPlaceRanking?.slice(0, 8) || [];
  return top8.includes(pick.team);
}

async function repair() {
  const { data: brackets, error } = await supabase
    .from("brackets")
    .select("id, data");

  if (error) throw error;

  for (const bracket of brackets || []) {
    const oldData = bracket.data;
    const oldWinners = oldData.winnersByMatch || {};
    const repairedWinners: Record<string, Slot> = {};

    for (const [matchId, pick] of Object.entries(oldWinners) as [
      string,
      Slot
    ][]) {
      if (isValidThirdPick(oldData, pick)) {
        repairedWinners[matchId] = pick;
      }
    }

    const newData = {
      ...oldData,
      winnersByMatch: repairedWinners,
    };

    const { error: updateError } = await supabase
      .from("brackets")
      .update({ data: newData })
      .eq("id", bracket.id);

    if (updateError) {
      console.error("Error updating", bracket.id, updateError.message);
    } else {
      console.log("Repaired", bracket.id);
    }
  }
}

repair();
