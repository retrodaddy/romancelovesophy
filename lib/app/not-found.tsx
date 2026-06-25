import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-serif text-6xl">404</p>
        <p className="mt-4 text-muted">This page wandered off somewhere quiet.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md border border-[var(--fg)] px-6 py-3 text-sm transition hover:bg-[var(--fg)] hover:text-[var(--bg)]"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
