import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AdminCategoriesTemplate from "@/components/templates/admin/admin-categories-template";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  toggleAdminCategoryStatus,
  toggleAdminCategoryFeatured,
} from "@/lib/functions/admin/categories";
import type {
  NormalizedCategory,
  CategoryFormValues,
} from "@/types/category-types";

export const Route = createFileRoute("/(admin)/admin/categories/")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<NormalizedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await getAdminCategories({
        limit: 50,
        offset: 0,
      });
      setCategories(result.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryStatusChange = async (
    categoryId: string,
    newStatus: boolean
  ) => {
    try {
      await toggleAdminCategoryStatus({
        id: categoryId,
        isActive: newStatus,
      });

      // Update local state
      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? { ...category, isActive: newStatus }
            : category
        )
      );
    } catch (err) {
      console.error("Error toggling category status:", err);
      // Optionally show error notification
    }
  };

  const handleAddCategory = async (data: CategoryFormValues) => {
    try {
      const result = await createAdminCategory({
        ...data,
        shopId: data.shopId || undefined, // Allow undefined for global categories
      });

      if (result.category) {
        setCategories([...categories, result.category]);
      }
    } catch (err) {
      console.error("Error adding category:", err);
      // Optionally show error notification
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleEditCategory = async (category: NormalizedCategory) => {
    try {
      const result = await updateAdminCategory({
        id: category.id,
        shopId: category.shopId,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        icon: category.icon || "",
        parentId: category.parentId || "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        featured: category.featured,
      });

      if (result.category) {
        setCategories(
          categories.map((cat) =>
            cat.id === category.id ? result.category : cat
          )
        );
      }
    } catch (err) {
      console.error("Error updating category:", err);
      // Optionally show error notification
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleDeleteCategory = async (category: NormalizedCategory) => {
    try {
      await deleteAdminCategory({ id: category.id });

      // Remove from local state
      setCategories(categories.filter((cat) => cat.id !== category.id));
    } catch (err) {
      console.error("Error deleting category:", err);
      // Optionally show error notification
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleToggleFeatured = async (category: NormalizedCategory) => {
    try {
      await toggleAdminCategoryFeatured({
        id: category.id,
        featured: !category.featured,
      });

      // Update local state
      setCategories(
        categories.map((cat) =>
          cat.id === category.id ? { ...cat, featured: !cat.featured } : cat
        )
      );
    } catch (err) {
      console.error("Error toggling category featured:", err);
      // Optionally show error notification
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <AdminCategoriesTemplate
      categories={categories}
      onCategoryStatusChange={handleCategoryStatusChange}
      onAddCategory={handleAddCategory}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onToggleFeatured={handleToggleFeatured}
    />
  );
}
