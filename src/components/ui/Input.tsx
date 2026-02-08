import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-default ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
