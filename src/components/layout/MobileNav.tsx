"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  SwordsIcon,
  BookOpen,
  MoreHorizontal,
  User,
  Weight,
  HeartPulse,
  Target,
  CalendarDays,
  Brain,
  Flame,
  Timer,
  Settings,
  X,
} from "lucide-react";
import { hapticLight } from "@/lib/utils/haptics";

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
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/challenge", label: "Challenge", icon: Flame },
  { href: "/profile", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* More Menu Sheet */}
      {showMore && (
        <>
          {/* Dark overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            style={{ animation: "fadeIn 200ms ease-out" }}
            onClick={() => setShowMore(false)}
          />
          {/* Sheet */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a24] z-40 rounded-t-3xl"
            style={{ animation: "slideUp 300ms ease-out" }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mt-3" />

            {/* X button */}
            <button
              onClick={() => setShowMore(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

            <div className="px-6 pt-5 pb-8">
              <div className="grid grid-cols-3 gap-4">
                {moreItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={`${item.href}-${index}`}
                      href={item.href}
                      onClick={() => { hapticLight(); setShowMore(false); }}
                      className="flex flex-col items-center gap-2 py-3 active:scale-[0.97] transition-transform"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-red-500/15 text-red-400"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActive ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f13]/95 backdrop-blur-lg border-t border-white/5 z-50"
        aria-label="Mobile navigation"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          height: "calc(5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex justify-around items-center h-16">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => hapticLight()}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-150 ${
                  isActive ? "text-red-500" : "text-gray-500"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => { hapticLight(); setShowMore(!showMore); }}
            aria-label="More"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-150 ${
              isMoreActive || showMore ? "text-red-500" : "text-gray-500"
            }`}
          >
            <MoreHorizontal size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">More</span>
            {isMoreActive && (
              <div className="w-1 h-1 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
