"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  SwordsIcon,
  HeartPulse,
  Weight,
  Target,
  User,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { useSubscription } from "@/lib/hooks/useSubscription";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/notebook", label: "Notebook", icon: BookOpen },
  { href: "/sparring", label: "Sparring", icon: SwordsIcon },
  { href: "/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/strength", label: "Strength", icon: Weight },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { plan } = useSubscription();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[#0f0f13] border-r border-border" role="navigation" aria-label="Main navigation">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Clinch<span className="text-red-500">.</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center space-x-3 px-4 py-3 rounded-button transition-default ${
                isActive
                  ? "bg-[rgba(239,68,68,0.15)] border-l-[3px] border-red-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-gray-500">Clinch v1.0</p>
        <PlanBadge plan={plan} />
      </div>
    </aside>
  );
}
