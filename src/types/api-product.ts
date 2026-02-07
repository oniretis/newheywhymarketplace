export interface ApiProduct {
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

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  level: number;
  productCount: number;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  parentId: string | null;
}
