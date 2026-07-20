"use client";

import { useEffect, useState, startTransition } from "react";
import { getWalletAction } from "@/app/actions/auth";
import {
  listBanksAction,
  updateBankProfileAction,
  requestWithdrawalAction,
  redeemPointsAction,
} from "@/app/actions/wallet";
import { Coins, Sparkles, Building, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  StatCard,
  Button,
  Badge,
  Modal,
  Field,
  Input,
  Select,
  ErrorState,
  SkeletonCard,
} from "@/components/ui";

// Single source of truth for the points→cash rate (was contradictory: "1pt=₦1" vs pts/10).
const POINT_TO_NGN = 1;

export default function EmployeeWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modal, setModal] = useState<null | "redeem" | "withdraw" | "bank">(null);

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [redemptionType, setRedemptionType] = useState("CASH");
  const [redeemPointsVal, setRedeemPointsVal] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("MTN");
  const [dataCode, setDataCode] = useState("1.5GB");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [w, bankList] = await Promise.all([getWalletAction(), listBanksAction()]);
      if (w) setWallet(w);
      setBanks(bankList || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    setModal(null);
    setErrors({});
  };

  const handleUpdateBankProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!bankCode) errs.bankCode = "Select a bank.";
    if (!accountNumber) errs.accountNumber = "Enter your account number.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBankLoading(true);
    const formData = new FormData();
    formData.append("bankCode", bankCode);
    formData.append("accountNumber", accountNumber);
    startTransition(async () => {
      try {
        const res = await updateBankProfileAction(null, formData);
        if (res.success) {
          toast("Bank account linked.");
          closeModal();
          loadData();
        } else {
          toast(res.error || "Failed to update bank profile.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setBankLoading(false);
      }
    });
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) {
      setErrors({ withdraw: "Enter an amount to withdraw." });
      return;
    }
    setWithdrawLoading(true);
    const formData = new FormData();
    formData.append("amount", withdrawAmount);
    startTransition(async () => {
      try {
        const res = await requestWithdrawalAction(null, formData);
        if (res.success) {
          // Payout is a genuinely meaningful moment → celebrate.
          toast(`Withdrawal of ₦${Number(withdrawAmount).toLocaleString()} submitted.`);
          setWithdrawAmount("");
          closeModal();
          loadData();
        } else {
          toast(res.error || "Failed to submit withdrawal request.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setWithdrawLoading(false);
      }
    });
  };

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemPointsVal) {
      setErrors({ redeem: "Enter the points to redeem." });
      return;
    }
    setRedeemLoading(true);
    const formData = new FormData();
    formData.append("amount", redeemPointsVal);
    formData.append("type", redemptionType);
    if (redemptionType !== "CASH") {
      formData.append("phoneNumber", phoneNumber);
      formData.append("provider", provider);
      if (redemptionType === "INTERNET") formData.append("dataCode", dataCode);
    }
    startTransition(async () => {
      try {
        const res = await redeemPointsAction(null, formData);
        if (res.success) {
          toast("Points redeemed.");
          setRedeemPointsVal("");
          setPhoneNumber("");
          closeModal();
          loadData();
        } else {
          toast(res.error || "Failed to redeem points.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setRedeemLoading(false);
      }
    });
  };

  const ptsBalance = wallet ? Number(wallet.bonusPoints ?? 0) : 0;
  const cashBalance = wallet ? Number(wallet.balance ?? 0) : 0;
  const hasBankProfile = wallet?.bankCode && wallet?.accountNumber;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet & Payouts"
        subtitle="Convert points to cash, airtime, or data, and withdraw earnings to your bank."
        action={
          <>
            <Button variant="secondary" onClick={() => setModal("redeem")} disabled={loading || ptsBalance < 10}>
              Redeem points
            </Button>
            <Button onClick={() => setModal("withdraw")} disabled={loading || !hasBankProfile || cashBalance < 100}>
              Withdraw
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-28" />
          <SkeletonCard className="h-28" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load your wallet. Please try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              tone="brand"
              icon={<Sparkles className="w-5 h-5" />}
              label="Earned bonus points"
              value={`${ptsBalance.toLocaleString()} pts`}
              hint={`≈ ₦${(ptsBalance * POINT_TO_NGN).toLocaleString()} at 1 pt = ₦${POINT_TO_NGN}`}
            />
            <StatCard
              icon={<Coins className="w-5 h-5" />}
              label="Withdrawable cash"
              value={`₦${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          </div>

          {/* Payout account */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="t-h3 text-[var(--text)] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[var(--brand-bright)]" /> Settlement bank
                </h3>
                <p className="t-caption text-[var(--muted)] mt-1">
                  Link a bank account to receive cash withdrawals.
                </p>
                <div className="mt-3">
                  {hasBankProfile ? (
                    <Badge tone="success">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Linked · {wallet.bankCode} ·{" "}
                      {wallet.accountNumber}
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      <AlertCircle className="w-3.5 h-3.5" /> No bank linked
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setModal("bank")}>
                {hasBankProfile ? "Update bank" : "Link bank"}
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Redeem modal */}
      <Modal
        open={modal === "redeem"}
        onClose={closeModal}
        title="Redeem points"
        description="Exchange reward points for cash or utility."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleRedeemPoints} loading={redeemLoading} disabled={ptsBalance < 10}>
              Exchange points
            </Button>
          </>
        }
      >
        <form onSubmit={handleRedeemPoints} className="space-y-4">
          <Field label="Redeem option">
            {({ id }) => (
              <Select id={id} value={redemptionType} onChange={(e) => setRedemptionType(e.target.value)}>
                <option value="CASH">Convert to NGN cash (1 pt = ₦{POINT_TO_NGN})</option>
                <option value="AIRTIME">Mobile airtime payout</option>
                <option value="INTERNET">Internet data transfer</option>
              </Select>
            )}
          </Field>
          <Field
            label="Points amount"
            required
            error={errors.redeem}
            hint={`Available: ${ptsBalance.toLocaleString()} pts (≈ ₦${(ptsBalance * POINT_TO_NGN).toLocaleString()})`}
          >
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                type="number"
                min="10"
                placeholder="e.g. 500"
                value={redeemPointsVal}
                onChange={(e) => setRedeemPointsVal(e.target.value)}
              />
            )}
          </Field>
          {redemptionType !== "CASH" && (
            <div className="space-y-4 animate-fade-in border-t border-[var(--line)] pt-4">
              <Field label="Recipient mobile number" required>
                {({ id }) => (
                  <Input id={id} type="tel" placeholder="e.g. 08012345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                )}
              </Field>
              <Field label="Network provider">
                {({ id }) => (
                  <Select id={id} value={provider} onChange={(e) => setProvider(e.target.value)}>
                    <option value="MTN">MTN Nigeria</option>
                    <option value="Airtel">Airtel</option>
                    <option value="Glo">Globacom</option>
                    <option value="9mobile">9mobile</option>
                  </Select>
                )}
              </Field>
              {redemptionType === "INTERNET" && (
                <Field label="Data package plan">
                  {({ id }) => (
                    <Select id={id} value={dataCode} onChange={(e) => setDataCode(e.target.value)}>
                      <option value="1.5GB">1.5 GB monthly plan</option>
                      <option value="3GB">3 GB plan</option>
                      <option value="10GB">10 GB power plan</option>
                    </Select>
                  )}
                </Field>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Withdraw modal */}
      <Modal
        open={modal === "withdraw"}
        onClose={closeModal}
        title="Cash out withdrawal"
        description="Disburse your NGN cash earnings to your linked bank account."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleWithdrawal} loading={withdrawLoading} disabled={!hasBankProfile || cashBalance < 100}>
              Request withdrawal
            </Button>
          </>
        }
      >
        {!hasBankProfile ? (
          <div className="flex items-start gap-3 rounded-[var(--r)] bg-[var(--gold-tint)] text-[var(--gold)] p-4 t-small">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Link a bank account before requesting a withdrawal.
          </div>
        ) : (
          <form onSubmit={handleWithdrawal}>
            <Field
              label="Withdrawal amount (NGN)"
              required
              error={errors.withdraw}
              hint={`Max: ₦${cashBalance.toLocaleString()} · Minimum ₦100`}
            >
              {({ id, invalid }) => (
                <div className="relative">
                  <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--faint)] pointer-events-none" />
                  <Input
                    id={id}
                    invalid={invalid}
                    className="pl-11"
                    type="number"
                    min="100"
                    max={cashBalance}
                    placeholder="e.g. 5000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
              )}
            </Field>
          </form>
        )}
      </Modal>

      {/* Bank modal */}
      <Modal
        open={modal === "bank"}
        onClose={closeModal}
        title={hasBankProfile ? "Update settlement bank" : "Link settlement bank"}
        description="We use this account to pay out your cash withdrawals."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleUpdateBankProfile} loading={bankLoading}>
              {hasBankProfile ? "Update bank" : "Link bank"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateBankProfile} className="space-y-4">
          <Field label="Settlement bank" required error={errors.bankCode}>
            {({ id, invalid }) => (
              <Select id={id} invalid={invalid} value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
                <option value="" disabled>Select bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Account number" required error={errors.accountNumber}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                maxLength={10}
                placeholder="e.g. 0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            )}
          </Field>
        </form>
      </Modal>
    </div>
  );
}
