"use client";

import { useState, useEffect, startTransition } from "react";
import { getMeAction, getWalletAction } from "@/app/actions/auth";
import {
  getTransactionsAction,
  listBanksAction,
  updateBankProfileAction,
  requestWithdrawalAction,
} from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import {
  User,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  RefreshCw,
} from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  purpose: string;
  status: string;
  reference: string;
  createdAt: string;
};

type Bank = {
  code: string;
  name: string;
};

export default function EmployeeProfile() {
  const [empUser, setEmpUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadProfileAndWallet = async () => {
    const me = await getMeAction();
    if (me) setEmpUser(me);

    const w = await getWalletAction();
    if (w) {
      setWallet(w);
      if (w.bankCode) setBankCode(w.bankCode);
      if (w.accountNumber) setAccountNumber(w.accountNumber);
    }

    const txList = await getTransactionsAction();
    if (txList) setTransactions(txList);
  };

  useEffect(() => {
    async function loadData() {
      try {
        await loadProfileAndWallet();
        const bankList = await listBanksAction();
        if (bankList) setBanks(bankList);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode || !accountNumber) return;

    setBankLoading(true);
    const formData = new FormData();
    formData.append("bankCode", bankCode);
    formData.append("accountNumber", accountNumber);

    startTransition(async () => {
      try {
        const res = await updateBankProfileAction(null, formData);
        if (res.success) {
          celebrate("Bank profile updated and verified successfully!");
          await loadProfileAndWallet();
        } else {
          toast(res.error || "Failed to update bank details.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setBankLoading(false);
      }
    });
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;

    setWithdrawLoading(true);
    const formData = new FormData();
    formData.append("amount", withdrawAmount);

    startTransition(async () => {
      try {
        const res = await requestWithdrawalAction(null, formData);
        if (res.success) {
          celebrate(`Withdrawal request of ₦${parseFloat(withdrawAmount).toLocaleString()} submitted!`);
          setWithdrawAmount("");
          await loadProfileAndWallet();
        } else {
          toast(res.error || "Failed to process withdrawal.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setWithdrawLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white/80 p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm text-[var(--ink)]">Loading wallet profile...</span>
        </div>
      </div>
    );
  }

  const balance = wallet ? wallet.balance : 0.0;
  const bankName = wallet?.bankName || "Unregistered Bank";
  const accName = wallet?.accountName || "";
  const accNum = wallet?.accountNumber || "";

  return (
    <div className="space-y-6">
      {/* Wallet Balance Widget */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--indigo-tint)] text-[var(--indigo)] grid place-items-center">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-[22px] text-[var(--ink)] tracking-tight">
              ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[12.5px] text-[var(--muted)] font-medium">Available Payout Balance</p>
          </div>
        </div>

        {accNum ? (
          <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-3 flex items-center gap-3 text-xs">
            <Building className="w-4 h-4 text-[var(--faint)]" />
            <div>
              <b className="text-[var(--ink)] block">{accName}</b>
              <span className="text-[var(--muted)]">
                {bankName} · {accNum}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-[var(--rose)] font-bold bg-rose-50 border border-rose-100 px-3.5 py-2 rounded-xl">
            Please configure your withdrawal bank details below.
          </span>
        )}
      </div>

      {/* Main Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Config */}
        <div className="bg-white/90 backdrop-blur-md border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
          <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--indigo)]" /> Bank Account Profile
          </h3>
          <p className="text-[13px] text-[var(--muted)] font-medium mb-4">
            Verify and register your payout bank account. Real-time validation checks will be executed.
          </p>

          <form onSubmit={handleUpdateBank} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="bankCode">
                Select Bank
              </label>
              <select
                id="bankCode"
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                required
              >
                <option value="" disabled>Supported Banks</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="accountNumber">
                Account Number (10 digits)
              </label>
              <input
                id="accountNumber"
                type="text"
                maxLength={10}
                pattern="\d{10}"
                required
                placeholder="e.g. 0123456789"
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={bankLoading}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {bankLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Verify and Save Bank Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white/90 backdrop-blur-md border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
          <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[var(--rose)]" /> Payout Disbursement Request
          </h3>
          <p className="text-[13px] text-[var(--muted)] font-medium mb-4">
            Disburse funds from your wallet directly to your registered bank account via the Monnify Sandboxed network.
          </p>

          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="withdrawAmount">
                Amount (NGN)
              </label>
              <input
                id="withdrawAmount"
                type="number"
                min="100"
                max={balance}
                required
                placeholder={`Available max: ₦${balance.toLocaleString()}`}
                disabled={!accNum || balance < 100}
                className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] disabled:opacity-40"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={withdrawLoading || !accNum || balance < 100}
                className="w-full bg-[var(--rose)] hover:bg-rose-600 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {withdrawLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Request Bank Payout
                  </>
                )}
              </button>
              {(!accNum || balance < 100) && (
                <span className="text-[10px] text-[var(--rose)] font-bold mt-2 text-center block leading-tight">
                  {!accNum
                    ? "Please register your bank profile before requesting a payout."
                    : "Minimum withdrawal threshold is ₦100.00"}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4">
          Personal Transaction Ledger
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--faint)]">
            No transactions in your wallet history yet.
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="flex items-center justify-between gap-4 p-4 border border-[var(--line)] bg-[var(--surface-2)] rounded-[20px]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl grid place-items-center ${isCredit ? "bg-[var(--mint-tint)] text-[var(--mint)]" : "bg-[var(--rose-tint)] text-[var(--rose)]"}`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[var(--ink)] block">
                        {isCredit ? "Credit Bonus Award" : "Withdrawal Payout"}
                      </span>
                      <span className="text-[11px] text-[var(--faint)]">
                        {dateStr} · {tx.purpose ? tx.purpose.replace(/_/g, " ") : "Reward"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-extrabold block ${isCredit ? "text-[var(--mint)]" : "text-[var(--rose)]"}`}>
                      {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--faint)] uppercase">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
