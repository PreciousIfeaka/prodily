"use client";

import { useEffect, useState } from "react";
import {
  getMyTransactionsAction,
  type PaginationMeta,
  type TransactionRecord,
  type TransactionStatus,
} from "@/app/actions/transactions";
import { History, ArrowLeft, ArrowRight, Coins, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Select,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

export default function EmployeeTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<"" | TransactionStatus>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit, totalPages: 0 });

  const loadTransactions = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMyTransactionsAction(status || undefined, page, limit);
      setTransactions(res.transactions);
      setMeta(res.meta);
      if (!res.success) setError(true);
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

  const statusTone = (s: string) =>
    s === "SUCCESSFUL" ? "success" : s === "FAILED" ? "danger" : s === "REFUNDED" ? "info" : "warning";
  const statusIcon = (s: string) =>
    s === "SUCCESSFUL" ? (
      <CheckCircle className="w-3.5 h-3.5" />
    ) : s === "FAILED" ? (
      <AlertCircle className="w-3.5 h-3.5" />
    ) : s === "REFUNDED" ? (
      <ArrowLeft className="w-3.5 h-3.5" />
    ) : (
      <Clock className="w-3.5 h-3.5" />
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Transaction History"
        subtitle="Point earnings, redemptions, and bank withdrawal requests."
        action={
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
        }
      />

      <Card className="p-6 min-h-[300px]">
        <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--brand-bright)]" /> Timeline Ledger
        </h3>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-16" />
            <SkeletonCard className="h-16" />
            <SkeletonCard className="h-16" />
          </div>
        ) : error ? (
          <ErrorState onRetry={loadTransactions} message="We couldn't load your history. Please try again." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6" />}
            title="No transactions"
            description="No records match this filter yet."
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              {transactions.map((tx) => {
                const date = new Date(tx.createdAt).toLocaleString();
                const isCredit = tx.type === "CREDIT";
                return (
                  <div
                    key={tx.id}
                    className="flex flex-wrap items-center justify-between py-3 border-b border-[var(--line)] last:border-0 gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-[var(--r-sm)] grid place-items-center ${
                          isCredit
                            ? "bg-[var(--mint-tint)] text-[var(--brand-bright)]"
                            : "bg-[var(--rose-tint)] text-[var(--rose)]"
                        }`}
                      >
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={isCredit ? "success" : "danger"}>{tx.type}</Badge>
                          <span className="t-caption font-medium text-[var(--muted)] uppercase tracking-wide">
                            {tx.purpose?.replace(/_/g, " ") || "Transaction"}
                          </span>
                        </div>
                        <div className="t-caption text-[var(--muted)] mt-1">{date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`t-body font-medium ${
                          isCredit ? "text-[var(--brand-bright)]" : "text-[var(--rose)]"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {tx.purpose === "REWARD_PAYOUT"
                          ? `${Number(tx.amount).toLocaleString()} pts`
                          : `₦${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </div>
                      <Badge tone={statusTone(tx.status) as any}>
                        {statusIcon(tx.status)} {tx.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
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
