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
  Flame,
} from "lucide-react";

const mainItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/sparring", label: "Sparring", icon: SwordsIcon },
  { href: "/notebook", label: "Notebook", icon: BookOpen },
];

const moreItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/strength", label: "Strength", icon: Weight },
  { href: "/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/coach", label: "AI Coach", icon: Brain },
  { href: "/challenge", label: "Challenge", icon: Flame },
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
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowMore(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a24] border-t border-white/[0.08] z-40 rounded-t-2xl pb-safe">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">More</h3>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-red-500/10 text-red-400"
                          : "text-gray-400 hover:bg-white/5 active:bg-white/10"
                      }`}
                    >
                      <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f13] border-t border-white/5 z-50 pb-safe" aria-label="Mobile navigation">
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
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-default ${
                  isActive ? "text-red-500" : "text-gray-500"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            aria-label="More"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-default ${
              isMoreActive || showMore ? "text-red-500" : "text-gray-500"
            }`}
          >
            {showMore ? <X size={24} strokeWidth={2} /> : <MoreHorizontal size={24} strokeWidth={2} />}
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
