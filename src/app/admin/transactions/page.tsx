"use client";

import { useEffect, useState } from "react";
import {
  getAllTransactionsAdminAction,
  type PaginationMeta,
  type TransactionRecord,
  type TransactionStatus,
} from "@/app/actions/transactions";
import { History, Search, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | TransactionStatus>("");
  const [userId, setUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });
  const { toast } = useToast();

  const loadTransactions = async (requestedPage = page, requestedUserId = userId) => {
    setLoading(true);
    try {
      const res = await getAllTransactionsAdminAction(
        status || undefined,
        requestedUserId || undefined,
        requestedPage,
        limit,
      );
      setTransactions(res?.transactions || []);
      if (res?.meta) setMeta(res.meta);
      if (res && !res.success) toast(res.error || "Failed to load transactions.");
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

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          System Transactions Ledger
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Complete ledger of all financial debits, credits, utility redemptions, and bonus points conversions.
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white border border-[var(--line)] rounded-[22px] p-4 shadow-[var(--sh-sm)] flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--faint)] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by User UUID..."
              className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl pl-9 pr-4 py-2 outline-none focus:border-[var(--indigo)] font-body text-xs text-[var(--ink)] font-medium"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--indigo)] hover:bg-[var(--indigo-600)] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            Filter User
          </button>
        </form>

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
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--indigo)]" /> Ledger Entries
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin inline-block mr-2" />
            <span className="text-xs text-[var(--muted)] font-semibold">Loading ledger...</span>
          </div>
        ) : (transactions || []).length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <History className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">No transactions match the query criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Date</th>
                    <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Type / Purpose</th>
                    <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Recipient</th>
                    <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions || []).map((tx) => {
                    const date = new Date(tx.createdAt).toLocaleString();
                    const isCredit = tx.type === "CREDIT";
                    const reason = typeof tx.metadata?.reason === "string" ? tx.metadata.reason : null;

                    let statusIcon = <Clock className="w-4 h-4 text-amber-500" />;
                    let statusLabel = "PENDING";
                    if (tx.status === "SUCCESSFUL") {
                      statusIcon = <CheckCircle className="w-4 h-4 text-[var(--mint)]" />;
                      statusLabel = "SUCCESSFUL";
                    } else if (tx.status === "FAILED") {
                      statusIcon = <AlertCircle className="w-4 h-4 text-[var(--rose)]" />;
                      statusLabel = "FAILED";
                    } else if (tx.status === "REFUNDED") {
                      statusIcon = <ArrowLeft className="w-4 h-4 text-[var(--violet)]" />;
                      statusLabel = "REFUNDED";
                    }

                    return (
                      <tr key={tx.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-4 text-xs font-semibold text-[var(--muted)]">{date}</td>
                        <td className="py-4 text-xs font-bold text-[var(--ink)]">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-bold mr-2 ${isCredit ? "bg-green-50 text-[var(--mint)]" : "bg-red-50 text-[var(--rose)]"}`}>
                            {tx.type}
                          </span>
                          <span className="uppercase text-[10px] tracking-wider text-[var(--muted)]">
                            {tx.purpose?.replace(/_/g, " ") || "TRANSACTION"}
                          </span>
                          {reason && (
                            <div className="text-[9.5px] font-medium text-[var(--muted)] mt-0.5 normal-case">
                              Reason: {reason}
                            </div>
                          )}
                        </td>
                        <td
                          className="py-4 text-xs font-semibold text-[var(--ink)] truncate max-w-[160px]"
                          title={tx.user?.email || tx.wallet?.userId}
                        >
                          {tx.user
                            ? `${tx.user.firstName || ""} ${tx.user.lastName || ""}`.trim()
                            : tx.wallet?.userId || "Organization wallet"}
                        </td>
                        <td className="py-4 text-sm font-bold text-[var(--ink)]">
                          {isCredit ? "+" : "-"}
                          {tx.purpose === "REWARD_PAYOUT"
                            ? `${Number(tx.amount).toLocaleString()} pts`
                            : `₦${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {statusIcon}
                            <span className={tx.status === "SUCCESSFUL" ? "text-[var(--mint)]" : tx.status === "FAILED" ? "text-[var(--rose)]" : tx.status === "REFUNDED" ? "text-[var(--violet)]" : "text-amber-500"}>
                              {statusLabel}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
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
