import { createFileRoute } from "@tanstack/react-router";
import {
  getAllStaffApi,
  addStaffApi,
  deleteStaffApi,
} from "@/lib/server/staff";
import type { Staff } from "@/types/staff";

export const Route = createFileRoute("/api/staff/$")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getAllStaffApi();
        return Response.json(result);
      },
      POST: async ({ request }: { request: Request }) => {
        const data: Omit<Staff, "id" | "joinedDate"> = await request.json();
        const result = await addStaffApi(data);
        return Response.json(result);
      },
      DELETE: async ({ request }: { request: Request }) => {
        const { id } = await request.json();
        const result = await deleteStaffApi(id);
        return Response.json(result);
      },
    },
  },
});
