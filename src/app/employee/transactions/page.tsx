"use client";

import { useEffect, useState } from "react";
import {
  getMyTransactionsAction,
  type PaginationMeta,
  type TransactionRecord,
  type TransactionStatus,
} from "@/app/actions/transactions";
import { History, ArrowLeft, ArrowRight, Coins, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function EmployeeTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | TransactionStatus>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });
  const { toast } = useToast();

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await getMyTransactionsAction(status || undefined, page, limit);
      setTransactions(res.transactions);
      setMeta(res.meta);
      if (!res.success) toast(res.error);
    } catch (error) {
      console.error(error);
      setTransactions([]);
      toast("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [status, page]);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          My Transaction History
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Review all your point earnings, point redemptions, and bank withdrawal requests.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-[var(--line)] rounded-[22px] p-4 shadow-[var(--sh-sm)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider pl-1">
          Transaction Records
        </span>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider" htmlFor="statusFilter">
            Status
          </label>
          <select
            id="statusFilter"
            className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | TransactionStatus);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] min-h-[300px]">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--indigo)]" /> Timeline Ledger
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin inline-block mr-2" />
            <span className="text-xs text-[var(--muted)] font-semibold">Loading history...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <History className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3.5">
              {transactions.map((tx) => {
                const date = new Date(tx.createdAt).toLocaleString();
                const isCredit = tx.type === "CREDIT";

                let statusIcon = <Clock className="w-4 h-4 text-amber-500" />;
                let statusColor = "text-amber-500 bg-amber-50 border-amber-200";
                if (tx.status === "SUCCESSFUL") {
                  statusIcon = <CheckCircle className="w-4 h-4 text-[var(--mint)]" />;
                  statusColor = "text-[var(--mint)] bg-green-50 border-green-200";
                } else if (tx.status === "FAILED") {
                  statusIcon = <AlertCircle className="w-4 h-4 text-[var(--rose)]" />;
                  statusColor = "text-[var(--rose)] bg-red-50 border-red-200";
                } else if (tx.status === "REFUNDED") {
                  statusIcon = <ArrowLeft className="w-4 h-4 text-[var(--violet)]" />;
                  statusColor = "text-[var(--violet)] bg-purple-50 border-purple-200";
                }

                return (
                  <div
                    key={tx.id}
                    className="flex flex-wrap items-center justify-between p-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl grid place-items-center ${isCredit ? "bg-green-50 text-[var(--mint)]" : "bg-red-50 text-[var(--rose)]"}`}>
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--ink)]">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold mr-2 ${isCredit ? "bg-green-100 text-[var(--mint)]" : "bg-red-100 text-[var(--rose)]"}`}>
                            {tx.type}
                          </span>
                          <span className="uppercase text-[10px] tracking-wide font-bold text-[var(--muted)]">
                            {tx.purpose?.replace(/_/g, " ") || "TRANSACTION"}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-medium mt-1">
                          {date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-base font-extrabold ${isCredit ? "text-[var(--mint)]" : "text-[var(--rose)]"}`}>
                        {isCredit ? "+" : "-"}
                        {tx.purpose === "REWARD_PAYOUT"
                          ? `${Number(tx.amount).toLocaleString()} pts`
                          : `₦${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full border text-[10.5px] font-bold flex items-center gap-1.5 ${statusColor}`}>
                        {statusIcon}
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="text-xs font-bold text-[var(--muted)]">
                Page {page}{meta.totalPages > 0 ? ` of ${meta.totalPages}` : ""} · {meta.total} total
              </span>
              <button
                disabled={meta.totalPages > 0 ? page >= meta.totalPages : transactions.length < limit}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
