"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  Brain,
  Library,
  Flame,
  Timer,
} from "lucide-react";
import { getTodaysChallenge } from "@/lib/utils/dailyChallenge";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach", label: "AI Coach", icon: Brain },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/techniques", label: "Techniques", icon: Library },
  { href: "/challenge", label: "Challenge", icon: Flame, hasIndicator: true },
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/notebook", label: "Notebook", icon: BookOpen },
  { href: "/sparring", label: "Sparring", icon: SwordsIcon },
  { href: "/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/strength", label: "Strength", icon: Weight },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  useEffect(() => {
    loadChallengeStatus();
  }, []);

  const loadChallengeStatus = async () => {
    setLoadingChallenge(true);
    const { data } = await getTodaysChallenge();
    if (data) {
      setChallengeCompleted(data.completed);
    }
    setLoadingChallenge(false);
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[#0f0f13] border-r border-border" role="navigation" aria-label="Main navigation">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <img src="/clinch-logo.png" alt="Clinch" className="h-10 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const showIndicator = item.hasIndicator && !challengeCompleted && !loadingChallenge;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center space-x-3 px-4 py-3 rounded-button transition-default relative ${
                isActive
                  ? "bg-[rgba(239,68,68,0.15)] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {showIndicator && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-gray-500">Clinch v1.0</p>
      </div>
    </aside>
  );
}
