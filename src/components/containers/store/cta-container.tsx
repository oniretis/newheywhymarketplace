import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaContainerProps {
  className?: string;
  inline?: boolean;
}

export default function CtaContainer({ className, inline }: CtaContainerProps) {
  if (inline) {
    return (
      <div className={cn("flex w-full items-center", className)}>
        <Link to="/" className="@4xl:w-auto w-full">
          <Button
            variant="secondary"
            size="lg"
            type="button"
            className="@4xl:w-auto w-full gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:scale-105 transition-all duration-300 group"
          >
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              Shop Now
            </span>
            <ArrowUpRight className="size-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn("@4xl:px-12 @6xl:px-15 @7xl:px-20 px-5 pb-8", className)}
    >
      <div className="flex w-full items-center justify-end">
        <Link to="/">
          <Button
            variant="secondary"
            size="lg"
            type="button"
            className="gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:scale-105 transition-all duration-300 group"
          >
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              Shop Now
            </span>
            <ArrowUpRight className="size-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
