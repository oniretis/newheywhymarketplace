import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { createTagSchema } from "@/lib/validators/shared/tag-query";
import { getAdminShops } from "@/lib/functions/admin/shops";
import type { TagFormValues } from "@/types/tags";
import { useEffect, useState } from "react";

interface AdminAddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TagFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: TagFormValues | null;
}

export function AdminAddTagDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: AdminAddTagDialogProps) {
  const [shops, setShops] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [shopsLoading, setShopsLoading] = useState(false);

  // Fetch shops for admin to select from
  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      const response = await getAdminShops({
        limit: 100,
        offset: 0,
        status: "active", // Only show active shops
      });
      setShops(
        response.data.map((shop) => ({
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setShopsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchShops();
    }
  }, [open, fetchShops]);

  const fields: EntityFormField[] = [
    {
      name: "shopId",
      label: "Shop",
      required: true,
      type: "select",
      placeholder: "Select a shop",
      options: shops.map((shop) => ({
        value: shop.id,
        label: shop.name,
      })),
      description: "Choose which shop this tag belongs to",
      loading: shopsLoading,
    },
    {
      name: "name",
      label: "Tag Name",
      required: true,
      placeholder: "e.g. New Arrival, Best Seller, On Sale",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      required: true,
      placeholder: "e.g. new-arrival, best-seller, on-sale",
      description: "URL-friendly identifier for your tag",
    },
    {
      name: "description",
      label: "Description",
      required: false,
      placeholder: "Optional description for this tag",
      type: "textarea",
      description: "Brief explanation of what this tag represents",
    },
  ];

  return (
    <EntityFormDialog<TagFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Tag"
      description={"Create a new tag to organize products in a shop."}
      validationSchema={createTagSchema}
      submitButtonText={{
        create: "Create Tag",
        update: "Update Tag",
      }}
      fields={fields}
    />
  );
}
