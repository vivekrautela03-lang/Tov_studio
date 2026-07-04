import * as React from "react";
import { cn } from "./button";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = "primary", size = "sm", ...props }, ref) => {
    // Clamp value
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full bg-white/5 rounded-full overflow-hidden",
          size === "sm" && "h-1.5",
          size === "md" && "h-2.5",
          size === "lg" && "h-4",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            color === "primary" && "bg-primary",
            color === "secondary" && "bg-secondary",
            color === "success" && "bg-success",
            color === "danger" && "bg-danger",
            color === "warning" && "bg-warning"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
