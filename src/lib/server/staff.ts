import { getAllStaff, addStaffMember, deleteStaffMember } from "../staff";
import type { Staff } from "@/types/staff";

// Regular API functions that can be called from client components
export async function getAllStaffApi() {
  try {
    const staff = await getAllStaff();
    return { success: true, data: staff };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function addStaffApi(data: Omit<Staff, "id" | "joinedDate">) {
  try {
    // For admin, we'll use a default shop ID or get it from context
    const shopId = "admin-shop"; // This should come from admin context
    const newStaff = await addStaffMember({
      ...data,
      shopId,
    });
    return { success: true, data: newStaff };
  } catch (error) {
    console.error("Error adding staff:", error);
    return { success: false, error: "Failed to add staff" };
  }
}

export async function deleteStaffApi(id: string) {
  try {
    await deleteStaffMember(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Failed to delete staff" };
  }
}
