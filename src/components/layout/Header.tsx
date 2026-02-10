"use client";

import { usePathname } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState } from "react";
import { QuickLogModal } from "@/components/dashboard/QuickLogModal";

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    return path.charAt(0).toUpperCase() + path.slice(1) || "Dashboard";
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-[#0f0f13] border-b border-border px-4 py-4 md:px-6">
      <div className="flex items-center justify-between">
        {/* Left: Page Title */}
        <h2 className="text-xl md:text-2xl font-semibold text-white">
          {getPageTitle()}
        </h2>

        {/* Right: User Info & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuickLog(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-all duration-150"
          >
            <Plus size={16} />
            Quick Log
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm hover:bg-accent/80 transition-default"
            >
              {getUserInitials()}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border border-border shadow-lg z-20">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm text-white truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-default"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => setShowQuickLog(false)}
      />
    </header>
  );
}
