"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useApiClient } from "@/lib/api-client";
import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";

export function InvoicesTable({ teamId }: { teamId: string }) {
  const api = useApiClient();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setInvoices(null);
    setError(null);
    api
      .get<Invoice[]>(`/teams/${teamId}/invoices`)
      .then((res) => {
        if (!cancelled) setInvoices(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [api, teamId]);

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Issued</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {error ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-6 text-center text-sm text-destructive"
              >
                Couldn&apos;t load invoices. {error.message}
              </TableCell>
            </TableRow>
          ) : invoices === null ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                Loading…
              </TableCell>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                No invoices yet.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="text-sm font-medium">
                  {invoice.number}
                </TableCell>
                <TableCell className="text-sm">
                  {formatCurrency(invoice.amountUsd)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(invoice.issuedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
