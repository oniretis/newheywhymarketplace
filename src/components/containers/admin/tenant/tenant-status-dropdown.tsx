import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { updateVendorStatus } from "@/lib/functions/admin/vendors";
import type { AdminTenant } from "@/types/tenant";

interface TenantStatusDropdownProps {
  tenant: AdminTenant;
  onStatusChange?: (newStatus: string) => void;
}

const statusOptions = [
  {
    value: "pending_approval",
    label: "Pending Approval",
    variant: "secondary" as const,
  },
  { value: "active", label: "Active", variant: "default" as const },
  { value: "suspended", label: "Suspended", variant: "destructive" as const },
  { value: "rejected", label: "Rejected", variant: "destructive" as const },
];

export default function TenantStatusDropdown({
  tenant,
  onStatusChange,
}: TenantStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: updateVendorStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      onStatusChange?.(data.status);
      setIsOpen(false);
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({
      data: { vendorId: tenant.id, status: newStatus as any },
    });
  };

  const currentStatus =
    statusOptions.find((s) => s.value === tenant.status) || statusOptions[0];

  return (
    <div className="flex items-center gap-2">
      <Badge variant={currentStatus.variant} className="capitalize">
        {currentStatus.label}
      </Badge>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions
            .filter((option) => option.value !== tenant.status)
            .map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={updateStatusMutation.isPending}
              >
                Change to {option.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
