import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-card p-4 transition-default ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }: CardProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
