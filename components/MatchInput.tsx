export default function MatchInput() {
  return (
    <div className="flex gap-2 items-center">
      <span>USA</span>

      <input
        type="number"
        className="border w-12 text-center"
      />

      <span>-</span>

      <input
        type="number"
        className="border w-12 text-center"
      />

      <span>Mexico</span>
    </div>
  );
}