"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  SwordsIcon,
  TrendingUp,
  User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/sparring", label: "Sparring", icon: SwordsIcon },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-default ${
                isActive ? "text-accent" : "text-white/70"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
