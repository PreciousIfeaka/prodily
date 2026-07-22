"use client";

import { useEffect, useState } from "react";
import {
  getAllTransactionsAdminAction,
  type PaginationMeta,
  type TransactionRecord,
  type TransactionStatus,
} from "@/app/actions/transactions";
import { History, Search, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<"" | TransactionStatus>("");
  const [userId, setUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit, totalPages: 0 });

  const loadTransactions = async (requestedPage = page, requestedUserId = userId) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getAllTransactionsAdminAction(
        status || undefined,
        requestedUserId || undefined,
        requestedPage,
        limit
      );
      setTransactions(res?.transactions || []);
      if (res?.meta) setMeta(res.meta);
      if (res && !res.success) setError(true);
    } catch (err) {
      console.error(err);
      setTransactions([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextUserId = userSearch.trim();
    if (page === 1 && userId === nextUserId) {
      void loadTransactions(1, nextUserId);
      return;
    }
    setUserId(nextUserId);
    setPage(1);
  };

  const statusTone = (s: string) =>
    s === "SUCCESSFUL" ? "success" : s === "FAILED" ? "danger" : s === "REFUNDED" ? "info" : "warning";
  const statusIcon = (s: string) =>
    s === "SUCCESSFUL" ? <CheckCircle className="w-3.5 h-3.5" /> : s === "FAILED" ? <AlertCircle className="w-3.5 h-3.5" /> : s === "REFUNDED" ? <ArrowLeft className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Transactions Ledger"
        subtitle="Complete ledger of debits, credits, redemptions, and point conversions."
      />

      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Search by user UUID…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Filter</Button>
        </form>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | TransactionStatus);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">All statuses</option>
          <option value="SUCCESSFUL">Successful</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
      </Card>

      <Card className="p-6">
        <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--brand-bright)]" /> Ledger Entries
        </h3>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-14" />
            <SkeletonCard className="h-14" />
            <SkeletonCard className="h-14" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => loadTransactions()} message="We couldn't load the ledger. Please try again." />
        ) : transactions.length === 0 ? (
          <EmptyState icon={<History className="w-6 h-6" />} title="No transactions" description="No records match this query." />
        ) : (
          <div className="space-y-4">
            <Table columns={["Date", "Type / Purpose", "Recipient", "Amount", "Status"]} caption="Organization transaction ledger">
              {transactions.map((tx) => {
                const date = new Date(tx.createdAt).toLocaleString();
                const isCredit = tx.type === "CREDIT";
                const reason = typeof tx.metadata?.reason === "string" ? tx.metadata.reason : null;
                return (
                  <Tr key={tx.id}>
                    <Td className="text-[var(--muted)]">{date}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge tone={isCredit ? "success" : "danger"}>{tx.type}</Badge>
                        <span className="t-caption text-[var(--muted)] uppercase tracking-wide">
                          {tx.purpose?.replace(/_/g, " ") || "Transaction"}
                        </span>
                      </div>
                      {reason && <div className="t-caption text-[var(--muted)] mt-0.5">Reason: {reason}</div>}
                    </Td>
                    <Td className="max-w-[160px] truncate">
                      {tx.user
                        ? `${tx.user.firstName || ""} ${tx.user.lastName || ""}`.trim()
                        : tx.wallet?.userId || "Organization wallet"}
                    </Td>
                    <Td className="font-medium">
                      {isCredit ? "+" : "-"}
                      {tx.purpose === "REWARD_PAYOUT"
                        ? `${Number(tx.amount).toLocaleString()} pts`
                        : `₦${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </Td>
                    <Td>
                      <Badge tone={statusTone(tx.status) as any}>
                        {statusIcon(tx.status)} {tx.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Table>

            <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Previous
              </Button>
              <span className="t-caption font-medium text-[var(--muted)]">
                Page {page}
                {meta.totalPages > 0 ? ` of ${meta.totalPages}` : ""} · {meta.total} total
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.totalPages > 0 ? page >= meta.totalPages : transactions.length < limit}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
