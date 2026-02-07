import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-lg">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This area is restricted to administrators only.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
