"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  HeartPulse,
  User,
  MoreHorizontal,
  SwordsIcon,
  Weight,
  CalendarDays,
  BookOpen,
  Target,
  Brain,
  X,
} from "lucide-react";

const mainItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/profile", label: "Profile", icon: User },
];

const moreItems = [
  { href: "/coach", label: "AI Coach", icon: Brain },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/notebook", label: "Notebook", icon: BookOpen },
  { href: "/sparring", label: "Sparring", icon: SwordsIcon },
  { href: "/strength", label: "Strength", icon: Weight },
  { href: "/goals", label: "Goals", icon: Target },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMore(false)}
          />
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-[#1a1a24] border-t border-white/[0.08] z-40 rounded-t-xl p-4">
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-150 ${
                      isActive
                        ? "bg-red-500/10 text-red-400"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a24] border-t border-border z-40" aria-label="Mobile navigation">
        <div className="flex justify-around items-center h-16">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                onClick={() => setShowMore(false)}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-default ${
                  isActive ? "text-red-400" : "text-white/70"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            aria-label="More"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-default ${
              isMoreActive || showMore ? "text-red-400" : "text-white/70"
            }`}
          >
            {showMore ? <X size={20} /> : <MoreHorizontal size={20} />}
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
