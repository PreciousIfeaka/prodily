"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMeAction, getWalletAction } from "@/app/actions/auth";
import { getTransactionsAction } from "@/app/actions/wallet";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CreditCard,
  Mail,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from "lucide-react";
import {
  PageHeader,
  Card,
  StatCard,
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

type Transaction = {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  purpose: string;
  status: string;
  reference: string;
  createdAt: string;
};

export default function EmployeeProfile() {
  const [empUser, setEmpUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [me, w, txList] = await Promise.all([
        getMeAction(),
        getWalletAction(),
        getTransactionsAction(),
      ]);
      if (me) setEmpUser(me);
      if (w) setWallet(w);
      if (txList) setTransactions(txList);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fullName =
    [empUser?.firstName, empUser?.lastName].filter(Boolean).join(" ") || "Your account";
  const balance = wallet ? Number(wallet.balance ?? 0) : 0;
  const hasBank = wallet?.bankCode && wallet?.accountNumber;
  const roleLabel = (empUser?.userRole || "").replace(/_/g, " ").toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Account" subtitle="Your profile, payout account, and transaction history." />

      {loading ? (
        <div className="space-y-6">
          <SkeletonCard className="h-28" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load your account. Please try again." />
      ) : (
        <>
          {/* Identity */}
          <Card className="p-6 flex flex-wrap items-center gap-4">
            <Avatar name={fullName} size={56} />
            <div className="min-w-0 flex-1">
              <h2 className="t-h2 text-[var(--text)] truncate">{fullName}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 t-small text-[var(--muted)]">
                  <Mail className="w-4 h-4" /> {empUser?.email}
                </span>
                {roleLabel && <Badge tone="brand" className="capitalize">{roleLabel}</Badge>}
              </div>
            </div>
          </Card>

          {/* Payout summary — the wallet is the single place to manage bank & withdrawals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              tone="brand"
              icon={<CreditCard className="w-5 h-5" />}
              label="Available payout balance"
              value={`₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
            <Card className="p-5 flex items-center justify-between gap-4">
              <div>
                <div className="t-caption text-[var(--muted)] font-medium">Payout account</div>
                <div className="mt-2">
                  {hasBank ? (
                    <Badge tone="success">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {wallet.bankName || wallet.bankCode} ·{" "}
                      {wallet.accountNumber}
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      <AlertCircle className="w-3.5 h-3.5" /> No bank linked
                    </Badge>
                  )}
                </div>
              </div>
              <Link href="/employee/wallet">
                <Button variant="secondary" icon={<Wallet className="w-[18px] h-[18px]" />}>
                  Manage payouts
                </Button>
              </Link>
            </Card>
          </div>

          {/* Transaction ledger */}
          <Card className="p-6">
            <h3 className="t-h3 text-[var(--text)] mb-4">Transaction ledger</h3>
            {transactions.length === 0 ? (
              <EmptyState
                icon={<Building className="w-6 h-6" />}
                title="No transactions yet"
                description="Credits and payouts will appear here."
              />
            ) : (
              <div className="space-y-1">
                {transactions.map((tx) => {
                  const isCredit = tx.type === "CREDIT";
                  const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-[var(--line)] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-[var(--r-sm)] grid place-items-center ${
                            isCredit
                              ? "bg-[var(--mint-tint)] text-[var(--brand-bright)]"
                              : "bg-[var(--rose-tint)] text-[var(--rose)]"
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="t-small font-medium text-[var(--text)] block">
                            {isCredit ? "Credit bonus award" : "Withdrawal payout"}
                          </span>
                          <span className="t-caption text-[var(--muted)]">
                            {dateStr} · {tx.purpose ? tx.purpose.replace(/_/g, " ") : "Reward"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`t-small font-medium block ${
                            isCredit ? "text-[var(--brand-bright)]" : "text-[var(--rose)]"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="t-micro font-medium text-[var(--faint)] uppercase">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
