import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag } from "lucide-react";
import Navbar from "@/components/base/common/navbar";
import CartSheet from "@/components/containers/store/cart/cart-sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/auth-client";
import { useCartStore } from "@/lib/store/cart-store";
import { ModeToggle } from "../provider/mode-toggle";
import { MobileMenu } from "./mobile-menu";
import UserMenu from "./user-menu";

const navigationItems = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Products" },
  { to: "/category", label: "Categories" },
];

export default function Header() {
  const { data } = useSession();
  const user = data?.user;
  const { totalItems, setIsOpen } = useCartStore();

  return (
    <header className="@container sticky top-0 z-40 w-full border-b border-dashed bg-background/95 backdrop-blur-md supports-filter:bg-background/80 shadow-sm">
      <div className="@container container mx-auto grid @6xl:grid-cols-3 grid-cols-2 items-center px-4 py-6 @6xl:py-8">
        <Navbar items={navigationItems} />

        <div className="flex items-center justify-start @6xl:justify-center">
          <Link to="/" className="flex items-center group">
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="heywhymarketplace"
                className="h-8 @6xl:h-12 w-auto transition-all duration-300 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="@6xl:flex hidden items-center gap-3">
            <Button
              variant="outline"
              size="icon-lg"
              type="button"
              aria-label="Open Cart"
              onClick={() => setIsOpen(true)}
              className="relative border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
            >
              <ShoppingBag className="@7xl:size-6 size-5 transition-transform duration-200 group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground shadow-lg animate-pulse">
                  {totalItems}
                </span>
              )}
            </Button>
            <CartSheet />

            <div className="h-6 w-px bg-border/50" />

            <ModeToggle />

            <div className="h-6 w-px bg-border/50" />

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link to="/auth/sign-in">
                <Button
                  variant="default"
                  size="lg"
                  type="button"
                  className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="flex @6xl:hidden">
            <MobileMenu
              navigationItems={navigationItems}
              trigger={
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Open menu"
                  className="rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                >
                  <Menu className="size-5 transition-transform duration-200" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
