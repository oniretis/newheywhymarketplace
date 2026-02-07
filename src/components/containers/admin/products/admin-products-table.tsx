import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/base/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NormalizedProduct } from "@/types/products";

interface AdminProductsTableProps {
  products: NormalizedProduct[];
  className?: string;
}

export default function AdminProductsTable({
  products,
  className,
}: AdminProductsTableProps) {
  const columns: ColumnDef<NormalizedProduct>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="w-20 truncate text-muted-foreground text-xs">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("categoryName") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "brandName",
      header: "Brand",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("brandName") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const sellingPrice = parseFloat(row.getValue("sellingPrice"));
        const regularPrice = row.original.regularPrice
          ? parseFloat(row.original.regularPrice)
          : null;
        return (
          <div className="font-medium">
            ${sellingPrice.toFixed(2)}
            {regularPrice && regularPrice > sellingPrice && (
              <span className="ml-2 text-muted-foreground text-xs line-through">
                ${regularPrice.toFixed(2)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        const lowStockThreshold = row.original.lowStockThreshold;
        const inStock = stock > 0;
        const isLowStock = stock <= lowStockThreshold;

        let variant: "default" | "destructive" | "secondary" = "default";
        let text = `${stock} in stock`;

        if (!inStock) {
          variant = "destructive";
          text = "Out of Stock";
        } else if (isLowStock) {
          variant = "secondary";
          text = `Low Stock (${stock})`;
        }

        return <Badge variant={variant}>{text}</Badge>;
      },
    },
    {
      accessorKey: "averageRating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = parseFloat(row.getValue("averageRating"));
        const reviewCount = row.original.reviewCount;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">
              ({reviewCount} reviews)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "shopName",
      header: "Store",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("shopName") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => {
        const isFeatured = row.getValue("isFeatured") as boolean;
        return isFeatured ? (
          <Badge variant="secondary">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const isActive = row.original.isActive;

        let variant: "default" | "destructive" | "secondary" = "default";
        if (!isActive || status === "archived") {
          variant = "destructive";
        } else if (status === "draft") {
          variant = "secondary";
        }

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={products} className={className} />;
}
