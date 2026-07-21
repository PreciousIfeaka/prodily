"use client";

import { useEffect, useState, startTransition } from "react";
import { getWalletAction } from "@/app/actions/auth";
import {
  listBanksAction,
  updateBankProfileAction,
  requestWithdrawalAction,
  redeemPointsAction,
  resolveBankAccountAction,
  getBillerProductsAction,
} from "@/app/actions/wallet";
import { Sparkles, Building, Send, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Modal,
  Field,
  Input,
  Select,
  ErrorState,
  SkeletonCard,
  Spinner,
} from "@/components/ui";

export default function EmployeeWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const POINT_TO_NGN = wallet?.user?.organization?.pointToAmountValue
    ? Number(wallet.user.organization.pointToAmountValue)
    : 1.00;
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
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [resolvingAccount, setResolvingAccount] = useState(false);

  const [billerProducts, setBillerProducts] = useState<any[]>([]);
  const [billerProductsLoading, setBillerProductsLoading] = useState(false);
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const [airtimeAmount, setAirtimeAmount] = useState("");

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

  useEffect(() => {
    if (bankCode && accountNumber && accountNumber.length === 10) {
      setResolvingAccount(true);
      setResolvedAccountName("");
      setErrors((prev) => ({ ...prev, accountNumber: "" }));

      const timer = setTimeout(async () => {
        try {
          const res = await resolveBankAccountAction(bankCode, accountNumber);
          if (res.success && res.accountName) {
            setResolvedAccountName(res.accountName);
          } else {
            setErrors((prev) => ({ ...prev, accountNumber: res.error || "Could not resolve account." }));
          }
        } catch {
          setErrors((prev) => ({ ...prev, accountNumber: "Failed to connect for account verification." }));
        } finally {
          setResolvingAccount(false);
        }
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setResolvedAccountName("");
    }
  }, [bankCode, accountNumber]);

  const loadBillerProducts = async (p: string) => {
    setBillerProductsLoading(true);
    try {
      const res = await getBillerProductsAction(p);
      console.log("loadBillerProducts res:", JSON.stringify(res, null, 2));
      const items = res?.content || res?.data?.content || res || [];
      console.log("extracted items:", JSON.stringify(items, null, 2));
      setBillerProducts(items);

      const dataPlans = items.filter((item: any) => {
        const catCode = item.category?.code || (item.categories && item.categories[0]?.code);
        return catCode === "DATA_BUNDLE" || catCode === "DATA";
      });
      if (dataPlans.length > 0) {
        setSelectedProductCode(dataPlans[0].code);
      } else {
        setSelectedProductCode("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBillerProductsLoading(false);
    }
  };

  useEffect(() => {
    if (modal === "redeem" && redemptionType !== "CASH") {
      loadBillerProducts(provider);
    }
  }, [provider, redemptionType, modal]);

  const closeModal = () => {
    setModal(null);
    setErrors({});
    setResolvedAccountName("");
    setAirtimeAmount("");
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
    setErrors({});
    let amount = 0;

    if (redemptionType === "CASH") {
      amount = parseFloat(redeemPointsVal);
      if (isNaN(amount) || amount <= 0) {
        setErrors({ redeem: "Enter the points to redeem." });
        return;
      }
      if (amount > ptsBalance) {
        setErrors({ redeem: "Insufficient points balance." });
        return;
      }
    } else if (redemptionType === "AIRTIME") {
      const airNgn = parseFloat(airtimeAmount);
      if (isNaN(airNgn) || airNgn <= 0) {
        setErrors({ airtimeAmount: "Enter airtime amount in NGN." });
        return;
      }
      amount = Math.ceil(airNgn / POINT_TO_NGN);
      if (amount > ptsBalance) {
        setErrors({ airtimeAmount: `Insufficient points. Requires ${amount} pts.` });
        return;
      }
      if (!phoneNumber) {
        setErrors({ phoneNumber: "Recipient phone number is required." });
        return;
      }
    } else if (redemptionType === "INTERNET") {
      const selectedPlan = billerProducts.find(p => p.code === selectedProductCode);
      if (!selectedPlan) {
        setErrors({ selectedProductCode: "Please select a data plan." });
        return;
      }
      amount = Math.ceil(Number(selectedPlan.price) / POINT_TO_NGN);
      if (amount > ptsBalance) {
        setErrors({ selectedProductCode: `Insufficient points. Requires ${amount} pts.` });
        return;
      }
      if (!phoneNumber) {
        setErrors({ phoneNumber: "Recipient phone number is required." });
        return;
      }
    }

    setRedeemLoading(true);
    const formData = new FormData();
    formData.append("amount", String(amount));
    formData.append("type", redemptionType);
    if (redemptionType !== "CASH") {
      formData.append("phoneNumber", phoneNumber);
      formData.append("provider", provider);
      if (redemptionType === "INTERNET") {
        formData.append("dataCode", selectedProductCode);
      }
    }
    startTransition(async () => {
      try {
        const res = await redeemPointsAction(null, formData);
        if (res.success) {
          toast("Points redeemed successfully.");
          setRedeemPointsVal("");
          setAirtimeAmount("");
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
            {/* Premium landing-page-styled Reward Wallet card */}
            <div
              className="relative rounded-2xl p-6 overflow-hidden border border-white/10 text-white shadow-lg flex flex-col justify-between min-h-[170px]"
              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-600))" }}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-3 relative">
                  <Wallet className="h-5 w-5 text-white" />
                  <span className="text-sm font-semibold tracking-wide uppercase opacity-90">Reward Wallet</span>
                </div>
                <div className="relative">
                  <div className="text-[11.5px] text-white/75">Available balance (Cash)</div>
                  <div className="text-3xl font-bold tracking-tight mt-0.5">
                    ₦{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="mt-4 relative z-10">
                <button
                  onClick={() => setModal("withdraw")}
                  disabled={!hasBankProfile || cashBalance < 100}
                  className="text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 transition-colors cursor-pointer"
                >
                  Withdraw Cash
                </button>
              </div>
            </div>

            {/* Premium Points Balance card */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-[var(--brand-bright)]" />
                  <span className="text-sm font-semibold text-[var(--muted)] tracking-wide uppercase">Bonus Points</span>
                </div>
                <div>
                  <div className="text-[11.5px] text-[var(--muted)]">Total accumulated</div>
                  <div className="text-3xl font-bold text-[var(--text)] tracking-tight mt-0.5">
                    {ptsBalance.toLocaleString()} <span className="text-sm font-medium text-[var(--muted)]">pts</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-xs text-[var(--muted)]">
                  ≈ <span className="font-semibold text-[var(--text)]">₦{(ptsBalance * POINT_TO_NGN).toLocaleString()}</span> (1 pt = ₦{POINT_TO_NGN})
                </span>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setModal("redeem")}
                  disabled={ptsBalance < 10}
                >
                  Redeem Points
                </Button>
              </div>
            </div>
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Linked · {wallet.bankName || wallet.bankCode} · {wallet.accountNumber} {wallet.accountName ? `· ${wallet.accountName}` : ""}
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
            <Button onClick={handleRedeemPoints} loading={redeemLoading} disabled={ptsBalance < 1}>
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

          {redemptionType === "CASH" && (
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
                  min="1"
                  placeholder="e.g. 500"
                  value={redeemPointsVal}
                  onChange={(e) => setRedeemPointsVal(e.target.value)}
                />
              )}
            </Field>
          )}

          {redemptionType !== "CASH" && (
            <div className="space-y-4 animate-fade-in border-t border-[var(--line)] pt-4">
              <Field label="Recipient mobile number" required error={errors.phoneNumber}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                    }}
                  />
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

              {redemptionType === "AIRTIME" && (
                <Field label="Airtime amount (NGN)" required error={errors.airtimeAmount}>
                  {({ id, invalid }) => (
                    <Input
                      id={id}
                      invalid={invalid}
                      type="number"
                      min="50"
                      placeholder="e.g. 200"
                      value={airtimeAmount}
                      onChange={(e) => {
                        setAirtimeAmount(e.target.value);
                        setErrors((prev) => ({ ...prev, airtimeAmount: "" }));
                      }}
                    />
                  )}
                </Field>
              )}

              {redemptionType === "INTERNET" && (
                <Field label="Data package plan" error={errors.selectedProductCode}>
                  {({ id }) => (
                    <Select
                      id={id}
                      value={selectedProductCode}
                      onChange={(e) => {
                        setSelectedProductCode(e.target.value);
                        setErrors((prev) => ({ ...prev, selectedProductCode: "" }));
                      }}
                      disabled={billerProductsLoading}
                    >
                      {billerProductsLoading ? (
                        <option>Loading data plans...</option>
                      ) : billerProducts.filter(item => {
                        const catCode = item.category?.code || (item.categories && item.categories[0]?.code);
                        return catCode === 'DATA_BUNDLE' || catCode === 'DATA';
                      }).length === 0 ? (
                        <option>No data plans available</option>
                      ) : (
                        billerProducts.filter(item => {
                          const catCode = item.category?.code || (item.categories && item.categories[0]?.code);
                          return catCode === 'DATA_BUNDLE' || catCode === 'DATA';
                        }).map((p) => (
                          <option key={p.code} value={p.code}>{p.name} - ₦{p.price}</option>
                        ))
                      )}
                    </Select>
                  )}
                </Field>
              )}

              {/* Dynamic Points Cost Calculation */}
              <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-3 animate-fade-in mx-1">
                <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Equivalent Points Cost</div>
                <div className="text-sm font-bold text-[var(--text)] mt-0.5">
                  {redemptionType === "AIRTIME" ? (
                    `${airtimeAmount ? Math.ceil(Number(airtimeAmount) / POINT_TO_NGN) : 0} pts (≈ ₦${airtimeAmount || 0})`
                  ) : (
                    (() => {
                      const selectedPlan = billerProducts.find(p => p.code === selectedProductCode);
                      const price = selectedPlan ? Number(selectedPlan.price) : 0;
                      return `${price ? Math.ceil(price / POINT_TO_NGN) : 0} pts (≈ ₦${price})`;
                    })()
                  )}
                </div>
              </div>
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
              <>
                <Input
                  id={id}
                  invalid={invalid}
                  type="text"
                  list="banks-datalist"
                  placeholder="Type or select bank..."
                  value={banks.find((b) => b.code === bankCode)?.name || bankCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = banks.find((b) => b.name === val);
                    if (match) {
                      setBankCode(match.code);
                      setErrors((prev) => ({ ...prev, bankCode: "" }));
                    } else {
                      setBankCode(val);
                    }
                  }}
                />
                <datalist id="banks-datalist">
                  {banks.map((b) => (
                    <option key={b.code} value={b.name} />
                  ))}
                </datalist>
              </>
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
          {resolvingAccount && (
            <div className="text-xs text-[var(--muted)] flex items-center gap-1.5 animate-pulse pl-1">
              <Spinner size={12} /> Verifying account details...
            </div>
          )}
          {resolvedAccountName && (
            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-3 animate-fade-in mx-1">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Account name</div>
              <div className="text-sm font-bold text-[var(--text)] mt-0.5">{resolvedAccountName}</div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
