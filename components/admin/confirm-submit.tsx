"use client";

export function ConfirmSubmit({
  children,
  confirmText = "Are you sure? This cannot be undone.",
  className,
}: {
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className={
        className ??
        "rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-red-500 hover:text-red-400"
      }
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={
        className ??
        "rounded-md border border-[var(--fg)] px-5 py-2.5 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
      }
    >
      {children}
    </button>
  );
}
