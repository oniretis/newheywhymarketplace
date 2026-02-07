import { createFileRoute } from "@tanstack/react-router";
import {
  getUsers,
  deleteUser,
  createUser,
} from "@/lib/functions/admin/users";
import type { UserFormValues } from "@/types/users";

export const Route = createFileRoute("/api/users/$")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const users = await getUsers();
          return Response.json(users);
        } catch (error) {
          console.error("Error fetching users:", error);
          return Response.json(
            { error: "Failed to fetch users" },
            { status: 500 }
          );
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const userData: UserFormValues = await request.json();

          // Basic validation
          if (!userData.name || !userData.email) {
            return Response.json(
              { error: "Name and email are required" },
              { status: 400 }
            );
          }

          const newUser = await createUser(userData);
          return Response.json(newUser, { status: 201 });
        } catch (error) {
          console.error("Error creating user:", error);
          return Response.json(
            { error: "Failed to create user" },
            { status: 500 }
          );
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const { id } = await request.json();
          if (!id) {
            return Response.json(
              { error: "User ID is required" },
              { status: 400 }
            );
          }

          await deleteUser(id);
          return Response.json({ success: true });
        } catch (error) {
          console.error("Error deleting user:", error);
          return Response.json(
            { error: "Failed to delete user" },
            { status: 500 }
          );
        }
      },
    },
  },
});
