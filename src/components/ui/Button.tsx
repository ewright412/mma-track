import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const variants = {
    primary: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    secondary: "bg-[#252530] text-white hover:bg-[#2f2f3a] active:bg-[#353540]",
    ghost: "bg-transparent border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-3 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ touchAction: 'manipulation' }}
      {...props}
    >
      {children}
    </button>
  );
}
