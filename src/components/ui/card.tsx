import * as React from "react";
import { cn } from "./button";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card border border-white/5 rounded-xl overflow-hidden shadow-sm shadow-black/50 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-5 border-b border-white/5 flex flex-col gap-1.5", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold leading-none tracking-tight text-white", className)} {...props} />
);
CardTitle.displayName = "CardTitle";

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs text-text-secondary", className)} {...props} />
);
CardDescription.displayName = "CardDescription";

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props} />
);
CardContent.displayName = "CardContent";

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-t border-white/5 flex items-center bg-white/[0.01]", className)} {...props} />
);
CardFooter.displayName = "CardFooter";
