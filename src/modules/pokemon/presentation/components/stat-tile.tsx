export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-3xl font-bold tracking-tight">{value}</dd>
      {hint && (
        <dd className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</dd>
      )}
    </div>
  );
}
