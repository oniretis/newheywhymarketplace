import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AdminTagsTemplate from "@/components/templates/admin/admin-tags-template";
import {
  getAdminTags,
  createAdminTag,
  deleteAdminTag,
} from "@/lib/functions/admin/tags";
import type { TagFormValues, TagItem } from "@/types/tags";

export const Route = createFileRoute("/(admin)/admin/tags/")({
  component: AdminTagsPage,
});

function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags from database
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminTags({
        limit: 50,
        offset: 0,
      });
      setTags(response.data);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      setError(err instanceof Error ? err.message : "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = async (newTagData: TagFormValues) => {
    try {
      // For admin, we'll need to get the shopId - for now using a default or first available
      // In a real implementation, you'd have a way to select which shop to add the tag to
      const shopId = newTagData.shopId || "1"; // Default to shop "1" for now

      const response = await createAdminTag({
        shopId,
        name: newTagData.name,
        slug: newTagData.slug,
        description: newTagData.description,
        isActive: newTagData.isActive,
        sortOrder: newTagData.sortOrder,
      });

      if (response.success && response.tag) {
        // Refresh the tags list
        await fetchTags();
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
      throw err; // Re-throw to let the dialog handle the error
    }
  };

  const handleDeleteTag = async (tag: TagItem) => {
    try {
      const response = await deleteAdminTag({
        id: tag.id,
        shopId: tag.shopId,
      });

      if (response.success) {
        // Refresh the tags list
        await fetchTags();
      }
    } catch (err) {
      console.error("Failed to delete tag:", err);
      throw err; // Re-throw to let the table handle the error
    }
  };

  return (
    <AdminTagsTemplate
      tags={tags}
      onAddTag={handleAddTag}
      onDeleteTag={handleDeleteTag}
    />
  );
}
