import { supabase } from "@/lib/supabase";

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-4xl font-black">Bracket not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-5xl font-black">
          {data.name}
        </h1>

        <div className="rounded-3xl bg-white/10 p-6">
          <h2 className="mb-4 text-2xl font-bold">
            Saved Prediction
          </h2>

          <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}