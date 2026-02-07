import CollectionItem from "@/components/base/common/collection-item";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/lib/store/cart-store";
import { gridCellBorderClasses } from "@/lib/utils";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sellingPrice: number;
  regularPrice: number | null;
  stock: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

export default function CollectionContainer() {
  const columns2 = 2;
  const columns3 = 3;
  const { addItem } = useCartStore();
  const { data: productsData, isLoading, error } = useProducts({ limit: 6 });

  const handleAddToCart = (product: ApiProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      image: product.images[0]?.url || "",
      quantity: 1,
      maxQuantity: product.stock,
    });
  };

  if (isLoading) {
    return (
      <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  const products = productsData?.products || [];

  return (
    <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
      {products.map((product: ApiProduct, index: number) => (
        <CollectionItem
          key={product.id}
          image={product.images[0]?.url || ""}
          title={product.name}
          category={product.category?.name || "Uncategorized"}
          fit="Regular"
          price={`$${product.sellingPrice}`}
          className={gridCellBorderClasses(index, columns2, columns3, true)}
          onAddToCart={() => handleAddToCart(product)}
        />
      ))}
    </div>
  );
}
