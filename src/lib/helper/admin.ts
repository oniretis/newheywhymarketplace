import { isUserAdmin } from "./vendor";

/**
 * Require admin access for a function
 * Throws an error if the user is not an admin
 */
export const requireAdminAccess = async (userId: string): Promise<void> => {
  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    throw new Error(
      "Admin access required. You do not have permission to perform this action."
    );
  }
};
