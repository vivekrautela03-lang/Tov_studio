import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          // Variants
          variant === "primary" && "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10 border border-primary/20",
          variant === "secondary" && "bg-white/5 hover:bg-white/10 text-white border border-white/5",
          variant === "outline" && "bg-transparent hover:bg-white/5 text-white border border-white/10",
          variant === "ghost" && "bg-transparent hover:bg-white/5 text-text-secondary hover:text-white",
          variant === "danger" && "bg-danger hover:bg-danger/90 text-white shadow-md shadow-danger/10",
          variant === "success" && "bg-success hover:bg-success/90 text-white shadow-md shadow-success/10",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-xs rounded-sm",
          size === "md" && "px-4 py-2 text-sm rounded-md",
          size === "lg" && "px-6 py-3 text-base rounded-md",
          size === "icon" && "h-9 w-9 p-0 flex items-center justify-center",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { cn };
