'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { QuickLogModal } from './QuickLogModal';

interface QuickLogFABProps {
  onSaved?: () => void;
}

export function QuickLogFAB({ onSaved }: QuickLogFABProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* FAB - visible only on mobile, positioned above bottom nav */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-[#ef4444] rounded-full flex items-center justify-center shadow-lg shadow-[#ef4444]/30 hover:bg-[#dc2626] active:scale-95 transition-all duration-150"
        aria-label="Quick Log"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <QuickLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={onSaved}
      />
    </>
  );
}
