export const inputCls =
  "h-11 w-full rounded-md border border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted focus:border-[var(--fg)]";

export const labelCls = "mb-1.5 block text-sm text-muted";

export const btnCls =
  "rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]";

export const btnGhost =
  "rounded-md border border-line px-4 py-2 text-sm text-muted transition hover:border-[var(--fg)] hover:text-[var(--fg)]";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-card p-6">{children}</div>
  );
}

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {desc && <p className="mt-2 text-sm text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
