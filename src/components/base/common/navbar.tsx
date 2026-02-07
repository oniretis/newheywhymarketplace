import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
}

// Base navigation link styles
const baseLinkStyles = [
  "group relative flex @7xl:h-16 h-12 items-center justify-center rounded-xl",
  "border border-dashed bg-transparent px-5 @7xl:px-[30px]",
  "text-sm @5xl:text-base @7xl:text-lg font-medium",
  "text-foreground dark:text-body-80",
  "transition-all duration-300",
  "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
  "hover:shadow-md hover:scale-105",
  "dark:text-body-80 dark:hover:text-primary",
];

// Gradient overlay styles for hover effect
const gradientOverlayStyles = [
  "before:absolute before:inset-0 before:rounded-xl",
  "before:bg-gradient-to-r before:from-primary/10 before:to-transparent",
  "before:opacity-0 before:transition-opacity before:duration-300",
  "hover:before:opacity-100",
];

// Active state styles
const activeLinkStyles = [
  "@7xl:h-16 h-12 rounded-xl",
  "text-sm @5xl:text-base @7xl:text-lg font-semibold",
  "px-5 @7xl:px-[30px] bg-primary text-background",
  "border-transparent shadow-lg shadow-primary/25 scale-105",
];

// Active state gradient overlay
const activeGradientStyles = [
  "after:absolute after:inset-0 after:rounded-xl",
  "after:bg-gradient-to-r after:from-primary/20 after:to-transparent",
];

export default function Navbar({
  items,
  className = "hidden items-center gap-4 text-sm @5xl:flex",
  linkClassName = "",
  activeLinkClassName = "",
}: NavBarProps) {
  return (
    <nav className={cn(className)}>
      {items.map((item, index) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            [...baseLinkStyles, ...gradientOverlayStyles].join(" "),
            linkClassName
          )}
          activeProps={{
            className: cn(
              [...activeLinkStyles, ...activeGradientStyles].join(" "),
              activeLinkClassName
            ),
          }}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <span className="relative z-10 transition-transform duration-200 group-hover:scale-105 leading-tight">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
