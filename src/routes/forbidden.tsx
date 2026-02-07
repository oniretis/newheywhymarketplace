import { createFileRoute } from "@tanstack/react-router";
import ForbiddenPage from "@/components/pages/forbidden";

export const Route = createFileRoute("/forbidden")({
  component: ForbiddenPage,
});
