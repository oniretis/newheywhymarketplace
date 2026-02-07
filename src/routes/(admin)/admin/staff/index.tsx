import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AdminStaffTemplate from "@/components/templates/admin/admin-staff-template";
import type { Staff } from "@/types/staff";

export const Route = createFileRoute("/(admin)/admin/staff/")({
  component: AdminStaffPage,
});

function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff");
      const result = await response.json();
      if (result.success) {
        setStaff(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load staff");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (data: Omit<Staff, "id" | "joinedDate">) => {
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        await loadStaff(); // Reload staff list
      } else {
        setError(result.error || "Failed to add staff");
      }
    } catch (err) {
      setError("An unexpected error occurred while adding staff");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const response = await fetch("/api/staff", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        await loadStaff(); // Reload staff list
      } else {
        setError(result.error || "Failed to delete staff");
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting staff");
    }
  };

  if (loading) {
    return <div className="p-6">Loading staff data...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={loadStaff}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AdminStaffTemplate
      staff={staff}
      onAddStaff={handleAddStaff}
      onDeleteStaff={handleDeleteStaff}
    />
  );
}
