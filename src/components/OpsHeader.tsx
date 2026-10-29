"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Dashboard", href: "/operations/dashboard" },
  { label: "Partners", href: "/operations/partners" },
  { label: "Users", href: "/operations/users" },
];

export default function OpsHeader({ userName }: { userName?: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="border-b border-brand-border bg-brand-dark/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/operations/dashboard" className="text-lg font-bold tracking-tight text-brand-gold">
            ABRIA <span className="text-brand-muted font-normal">Ops</span>
          </Link>
          <nav className="hidden items-center gap-2 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-brand-muted transition hover:bg-brand-card hover:text-brand-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-brand-muted md:inline">{userName}</span>
          )}
          <Link
            href="/"
            className="text-sm text-brand-muted transition hover:text-brand-gold"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-md border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-gold transition hover:border-brand-gold disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
