"use client";

import { useEffect, useState, startTransition } from "react";
import { getWalletAction } from "@/app/actions/auth";
import { listBanksAction, updateBankProfileAction, requestWithdrawalAction, redeemPointsAction } from "@/app/actions/wallet";
import { Coins, Layers, PlusCircle, Sparkles, Building, Send, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function EmployeeWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states: Bank profile
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  // Form states: Withdrawal
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Form states: Point Redemption
  const [redemptionType, setRedemptionType] = useState("CASH");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("MTN");
  const [dataCode, setDataCode] = useState("1.5GB");
  const [redeemLoading, setRedeemLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const loadData = async () => {
    try {
      const w = await getWalletAction();
      if (w) {
        setWallet(w);
      }
      
      const bankList = await listBanksAction();
      setBanks(bankList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBankProfile = async (e: React.FormEvent) => {
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
          celebrate("Bank profile updated successfully!");
          loadData();
        } else {
          toast(res.error || "Failed to update bank profile.");
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
          celebrate(`Withdrawal request of ₦${Number(withdrawAmount).toLocaleString()} submitted successfully!`);
          setWithdrawAmount("");
          loadData();
        } else {
          toast(res.error || "Failed to submit withdrawal request.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setWithdrawLoading(false);
      }
    });
  };

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemPoints) return;

    setRedeemLoading(true);
    const formData = new FormData();
    formData.append("amount", redeemPoints);
    formData.append("type", redemptionType);
    if (redemptionType !== "CASH") {
      formData.append("phoneNumber", phoneNumber);
      formData.append("provider", provider);
      if (redemptionType === "INTERNET") {
        formData.append("dataCode", dataCode);
      }
    }

    startTransition(async () => {
      try {
        const res = await redeemPointsAction(null, formData);
        if (res.success) {
          celebrate("Points successfully redeemed!");
          setRedeemPoints("");
          setPhoneNumber("");
          loadData();
        } else {
          toast(res.error || "Failed to redeem points.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setRedeemLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading wallet...</span>
        </div>
      </div>
    );
  }

  const ptsBalance = wallet ? wallet.bonusPoints : 0;
  const cashBalance = wallet ? wallet.balance : 0;
  const hasBankProfile = wallet?.bankCode && wallet?.accountNumber;

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">
          My Wallet &amp; Payouts
        </h1>
        <p className="text-[14px] text-[var(--muted)] font-medium mt-1">
          Convert points to NGN cash, airtime, or internet data, and withdraw earnings to your bank account.
        </p>
      </div>

      {/* KPI Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[var(--indigo-tint)] grid place-items-center text-[var(--indigo)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[12.5px] text-[var(--muted)] font-medium">Earned Bonus Points</div>
              <div className="font-display font-bold text-3xl text-[var(--ink)]">
                {ptsBalance.toLocaleString()} <span className="text-sm text-[var(--muted)] font-bold uppercase">pts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[var(--mint-tint)] grid place-items-center text-[var(--mint)]">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[12.5px] text-[var(--muted)] font-medium">Withdrawable NGN Cash</div>
              <div className="font-display font-bold text-3xl text-[var(--ink)]">
                ₦{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point Redemption */}
        <div className="lg:col-span-1 bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
          <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--indigo)]" /> Points Redemption
          </h3>
          <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
            Exchange your reward points for cash or utility.
          </p>

          <form onSubmit={handleRedeemPoints} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="redeemType">
                Redeem Option
              </label>
              <select
                id="redeemType"
                className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={redemptionType}
                onChange={(e) => setRedemptionType(e.target.value)}
                required
              >
                <option value="CASH">Convert to NGN Cash (1 pt = ₦1)</option>
                <option value="AIRTIME">Mobile Airtime Payout</option>
                <option value="INTERNET">Internet Data Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="ptsToRedeem">
                Points amount
              </label>
              <input
                id="ptsToRedeem"
                type="number"
                required
                min="10"
                placeholder="e.g. 500"
                className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
              />
              <span className="text-[10px] text-[var(--muted)] pl-1 block font-medium">
                Available: {ptsBalance} pts (≈ ₦{(ptsBalance / 10).toLocaleString()})
              </span>
            </div>

            {redemptionType !== "CASH" && (
              <div className="space-y-3 animate-fade-in border-t pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="destPhone">
                    Recipient Mobile Number
                  </label>
                  <input
                    id="destPhone"
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="networkProv">
                    Network Provider
                  </label>
                  <select
                    id="networkProv"
                    className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    required
                  >
                    <option value="MTN">MTN Nigeria</option>
                    <option value="Airtel">Airtel</option>
                    <option value="Glo">Globacom</option>
                    <option value="9mobile">9mobile</option>
                  </select>
                </div>

                {redemptionType === "INTERNET" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="dataCodeSel">
                      Data Package Plan
                    </label>
                    <select
                      id="dataCodeSel"
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={dataCode}
                      onChange={(e) => setDataCode(e.target.value)}
                      required
                    >
                      <option value="1.5GB">1.5 GB Monthly Plan</option>
                      <option value="3GB">3 GB Plan</option>
                      <option value="10GB">10 GB Power Plan</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={redeemLoading || ptsBalance < 10}
              className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
            >
              {redeemLoading ? "Processing..." : "Exchange Points"}
            </button>
          </form>
        </div>

        {/* Bank Profile and Withdrawal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Profile config */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-[var(--indigo)]" /> Settlement Bank Profile
            </h3>
            <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
              Link your local bank account to receive withdrawals.
            </p>

            <form onSubmit={handleUpdateBankProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="bankCodeSel">
                  Select Settlement Bank
                </label>
                <select
                  id="bankCodeSel"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="accNum">
                  Account Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="accNum"
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. 0123456789"
                    className="flex-1 bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={bankLoading}
                    className="bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer whitespace-nowrap"
                  >
                    {bankLoading ? "Linking..." : "Link Bank"}
                  </button>
                </div>
              </div>
            </form>
            {hasBankProfile && (
              <span className="text-[10px] text-[var(--mint)] font-bold mt-2 pl-1 block">
                ✓ Bank account linked: Code {wallet.bankCode} · Account {wallet.accountNumber}
              </span>
            )}
          </div>

          {/* Withdrawal Request */}
          <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)]">
            <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-[var(--indigo)]" /> Cash Out Withdrawal
            </h3>
            <p className="text-[12px] text-[var(--muted)] font-medium mb-4">
              Disburse your NGN cash earnings directly to your linked bank account.
            </p>

            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="withdrawAmtInput">
                  Withdrawal Amount (NGN)
                </label>
                <input
                  id="withdrawAmtInput"
                  type="number"
                  required
                  min="100"
                  max={cashBalance}
                  placeholder="e.g. 5000"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={!hasBankProfile || cashBalance < 100}
                />
                {!hasBankProfile ? (
                  <span className="text-[10px] text-[var(--rose)] font-bold mt-1 block pl-1">
                    Please link a bank account profile above before requesting a withdrawal.
                  </span>
                ) : cashBalance < 100 ? (
                  <span className="text-[10px] text-[var(--muted)] font-bold mt-1 block pl-1">
                    Minimum withdrawal is ₦100.
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--muted)] pl-1 block font-medium">
                    Max: ₦{cashBalance.toLocaleString()}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || !hasBankProfile || cashBalance < 100 || !withdrawAmount}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {withdrawLoading ? "Disbursing..." : "Request Cash Out Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
