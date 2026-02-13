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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-overlay"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-card border border-border rounded-t-2xl md:rounded-card p-6 w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up md:animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
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
