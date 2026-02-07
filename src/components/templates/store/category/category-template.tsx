import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import CategoryGrid from "@/components/containers/store/category/category-grid";
import SidebarCategoryTree from "@/components/containers/store/category/sidebar-category-tree";
import NotFound from "@/components/base/empty/notfound";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/use-categories";

export default function CategoryTemplate() {
  const { data: allCategories = [], isLoading, error } = useCategories();
  const { data: featuredCategoriesData = [] } = useCategories({
    featured: true,
  });

  // Transform API categories to match component expected types
  const transformCategory = (cat: any) => ({
    ...cat,
    parentId: cat.parentId || undefined,
  });

  const rootCategories = allCategories
    .filter((cat) => !cat.parentId)
    .map(transformCategory);
  const featuredCategories = featuredCategoriesData.map(transformCategory);

  const cartSteps = [
    { label: "Home", href: "/" },
    { label: "Categories", isActive: true },
  ] as const;

  if (error) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-500">
            Failed to load categories. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>

          <div className="grid @5xl:grid-cols-12 gap-8">
            <div className="@5xl:col-span-3">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="@5xl:col-span-9 space-y-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if there are no categories
  if (rootCategories.length === 0 && featuredCategories.length === 0) {
    return (
      <div className="@container container mx-auto px-4 py-8">
        <BreadcrumbNav items={cartSteps} className="mb-4" />
        <NotFound
          title="No Categories Found"
          description="There are no categories available at the moment. Please check back later."
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="@container container mx-auto px-4 py-8">
      <BreadcrumbNav items={cartSteps} className="mb-4" />
      <h1 className="mt-4 font-bold text-3xl tracking-tight">All Categories</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Browse our wide range of product categories
      </p>

      <div className="grid @5xl:grid-cols-12 gap-8">
        {/* Sidebar - Categories Tree */}
        <div className="@5xl:col-span-3">
          <SidebarCategoryTree />
        </div>

        {/* Main Content */}
        <div className="@5xl:col-span-9 space-y-8">
          {featuredCategories.length > 0 ? (
            <div>
              <h2 className="mb-4 font-semibold text-xl">
                Featured Categories
              </h2>
              <CategoryGrid
                categories={featuredCategories}
                variant="featured"
                columns={{
                  default: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                }}
              />
            </div>
          ) : (
            rootCategories.length > 0 && (
              <div>
                <h2 className="mb-4 font-semibold text-xl">
                  Featured Categories
                </h2>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No featured categories available at the moment.</p>
                </div>
              </div>
            )
          )}

          <Separator />

          {/* All Categories */}
          {rootCategories.length > 0 ? (
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">All Categories</h2>
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="mt-6">
                <CategoryGrid
                  categories={rootCategories}
                  variant="default"
                  columns={{
                    default: 2,
                    sm: 3,
                    md: 3,
                    lg: 3,
                    xl: 4,
                  }}
                />
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <CategoryGrid
                  categories={rootCategories}
                  variant="list"
                  columns={{
                    default: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 2,
                  }}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <h2 className="mb-4 font-semibold text-xl">All Categories</h2>
              <p className="text-muted-foreground">
                No categories available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
