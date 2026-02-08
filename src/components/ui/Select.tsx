import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-background border border-border rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-default ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
