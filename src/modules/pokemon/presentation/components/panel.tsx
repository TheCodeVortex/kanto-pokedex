import type { ReactNode } from "react";

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900 ${className}`}
    >
      <header className="mb-5">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
