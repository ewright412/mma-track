import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", onFocus, ...props }: InputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (props.type === 'number') {
      e.target.select();
    }
    onFocus?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-default min-h-[44px] ${
          error ? "border-red-500" : ""
        } ${className}`}
        style={{ touchAction: 'manipulation' }}
        onFocus={handleFocus}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
