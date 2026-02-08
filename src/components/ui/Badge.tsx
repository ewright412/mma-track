import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-accent/20 text-accent",
    info: "bg-accent-blue/20 text-accent-blue",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-input text-xs font-medium transition-default ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
