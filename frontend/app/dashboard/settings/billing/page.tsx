"use client";

import { CreditCard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoicesTable } from "@/components/settings/invoices-table";
import { EmptyState } from "@/components/empty-state";
import { useCurrentUser } from "@/lib/current-user";
import { formatCurrency } from "@/lib/format";

// Owner only.
export default function SettingsBillingPage() {
  const { currentUser } = useCurrentUser();
  const isOwner = currentUser.membership.role === "OWNER";

  if (!isOwner) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Billing is owner-only"
        description="Ask an owner if you need access to invoices or payment methods."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  Business
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(499)} / month · billed monthly
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change plan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment method
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <CreditCard className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa •••• 4242</p>
                  <p className="text-xs text-muted-foreground">
                    Expires 08 / 2028
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            Past bills issued to {currentUser.team.name}.
          </p>
        </div>
        <InvoicesTable />
      </section>
    </div>
  );
}
