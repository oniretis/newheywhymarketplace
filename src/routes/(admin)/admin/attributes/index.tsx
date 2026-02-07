import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminAttributesTemplate from "@/components/templates/admin/admin-attributes-template";
import {
  getAdminAttributes,
  createAdminAttribute,
  deleteAdminAttribute,
} from "@/lib/functions/admin/attributes";
import type { AttributeFormValues, AttributeItem } from "@/types/attributes";

export const Route = createFileRoute("/(admin)/admin/attributes/")({
  component: AdminAttributesPage,
});

function AdminAttributesPage() {
  const queryClient = useQueryClient();

  // Fetch real attributes data
  const {
    data: attributesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: () => getAdminAttributes(),
  });

  // Create attribute mutation
  const createAttributeMutation = useMutation({
    mutationFn: createAdminAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });

  // Delete attribute mutation
  const deleteAttributeMutation = useMutation({
    mutationFn: deleteAdminAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });

  const handleAddAttribute = (newAttributeData: AttributeFormValues) => {
    createAttributeMutation.mutate(newAttributeData);
  };

  const handleDeleteAttribute = (attribute: AttributeItem) => {
    deleteAttributeMutation.mutate({ id: attribute.id });
  };

  if (isLoading) {
    return <div>Loading attributes...</div>;
  }

  if (error) {
    return <div>Error loading attributes: {error.message}</div>;
  }

  return (
    <AdminAttributesTemplate
      attributes={attributesData?.attributes || []}
      onAddAttribute={handleAddAttribute}
      onDeleteAttribute={handleDeleteAttribute}
    />
  );
}
