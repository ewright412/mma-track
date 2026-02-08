"use client";

import React from "react";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
}

export function Slider({ label, showValue = true, className = "", ...props }: SliderProps) {
  const [value, setValue] = React.useState(props.value || props.defaultValue || 5);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-white/80">{label}</label>
          {showValue && <span className="text-sm text-white/60">{value}</span>}
        </div>
      )}
      <input
        type="range"
        className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent ${className}`}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
