"use client";

import React from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-card border border-border rounded-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-default"
        >
          <X size={20} />
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-xl font-semibold text-white mb-4 pr-8">{title}</h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
