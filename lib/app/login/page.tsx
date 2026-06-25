import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin login", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-serif text-2xl">Romancelovesophy</p>
          <p className="mt-2 text-sm text-muted">Admin dashboard</p>
        </div>
        <Suspense fallback={<div className="mt-8 h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
