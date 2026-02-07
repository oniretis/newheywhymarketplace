import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollectionItemProps {
  image: string;
  title: string;
  category: string;
  fit: string;
  price: string;
  className?: string;
  onAddToCart?: () => void;
}
export default function CollectionItem({
  image,
  title,
  category,
  fit,
  price,
  className,
  onAddToCart,
}: CollectionItemProps) {
  return (
    <div className={cn("relativea border-dashed @6xl:p-[30px] p-5", className)}>
      <div className="overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-[386px] object-cover"
        />
      </div>

      <div className="@6xl:mt-[30px] mt-5 flex items-center justify-start @6xl:justify-between gap-3">
        <span className="rounded-full border-2 border-body-15 border-dashed bg-body-10 px-4 py-2 text-body-70 text-lg">
          {category}
        </span>
        <Button
          variant="secondary"
          size="lg"
          type="button"
          className="@6xl:inline-flex hidden gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:scale-105 transition-all duration-300 group"
          onClick={onAddToCart}
        >
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            Shop Now
          </span>
          <ShoppingCart className="transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>
      <div className="mt-3 space-y-3.5">
        <h4 className="font-medium font-mono text-lg">{title}</h4>
        <p className="font-mono text-muted-foreground text-sm">
          Fit: <span className="font-medium text-body-80">{fit}</span> Price:{" "}
          <span className="font-medium text-body-80">{price}</span>
        </p>
        <Button
          variant="secondary"
          size="lg"
          type="button"
          className="@6xl:hidden w-full gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:scale-105 transition-all duration-300 group"
          onClick={onAddToCart}
        >
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            Shop Now
          </span>
          <ShoppingCart className="transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
