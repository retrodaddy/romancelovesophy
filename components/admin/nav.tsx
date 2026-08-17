"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Lock,
  Quote,
  FileText,
  HeartHandshake,
  Tags,
  Download,
  Share2,
  Mail,
  MessageSquare,
  Users,
  UserPlus,
  Send,
  Settings,
  Menu as MenuIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/quotes", label: "Quotes", icon: Quote },
  { href: "/admin/articles", label: "Writings", icon: FileText },
  { href: "/admin/doing-good", label: "Doing Good", icon: HeartHandshake },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/social", label: "Social links", icon: Share2 },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/menu", label: "Menu", icon: MenuIcon },
  { href: "/admin/team", label: "Team logins", icon: UserPlus },
  { href: "/admin/security", label: "Security (2FA)", icon: Lock },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = path === l.href;
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-card text-[var(--fg)]" : "text-muted hover:text-[var(--fg)]"
            }`}
          >
            <Icon size={16} /> {l.label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:text-[var(--fg)]"
      >
        <ExternalLink size={16} /> View site
      </a>
      <form action={signOut}>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:text-[var(--fg)]">
          <LogOut size={16} /> Sign out
        </button>
      </form>
    </nav>
  );
}
