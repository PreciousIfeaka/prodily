"use client";

import { useEffect, useState, startTransition } from "react";
import { getMeAction, getOrgWalletAction } from "@/app/actions/auth";
import { getTeamsAction, deleteTeamAction } from "@/app/actions/onboarding";
import {
  listTeamWalletsAction,
  getRewardRequestsAction,
} from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import {
  Coins,
  Users,
  CheckSquare,
  Building,
  Plus,
  Send,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  PageHeader,
  Card,
  StatCard,
  Button,
  IconButton,
  Badge,
  Table,
  Tr,
  Td,
  EmptyState,
  ErrorState,
  ConfirmDialog,
  SkeletonCard,
} from "@/components/ui";
import CreateTeamModal from "./_components/CreateTeamModal";
import InviteEmployeeModal from "./_components/InviteEmployeeModal";
import FundWalletModal from "./_components/FundWalletModal";
import EmergencySupportModal from "./_components/EmergencySupportModal";
import TeamDetailsModal from "./_components/TeamDetailsModal";
import EditTeamModal from "./_components/EditTeamModal";
import ApprovalsQueue from "./_components/ApprovalsQueue";

type Team = { id: string; name: string; description?: string; size?: string };

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [orgWallet, setOrgWallet] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamWallets, setTeamWallets] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [modal, setModal] = useState<null | "team" | "invite" | "fund" | "support">(null);
  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const me = await getMeAction();
      if (!me) {
        setError(true);
        return;
      }
      setAdminUser(me);
      const [teamsResult, wallet, walletList, requestsResult] = await Promise.all([
        getTeamsAction(),
        getOrgWalletAction(me.organizationId),
        listTeamWalletsAction(),
        getRewardRequestsAction("PENDING"),
      ]);

      if (teamsResult?.success && teamsResult.teams?.length) {
        setTeams(teamsResult.teams);
      } else if (walletList?.length) {
        setTeams(
          walletList.map((w: any) => ({ id: w.team.id, name: w.team.name, description: w.team.description }))
        );
      } else if (me.team) {
        setTeams([{ id: me.team.id, name: me.team.name }]);
      }
      if (wallet) setOrgWallet(wallet);
      if (walletList) setTeamWallets(walletList);
      if (requestsResult) {
        const normalized = Array.isArray(requestsResult)
          ? requestsResult
          : requestsResult.requests || requestsResult.data || [];
        setPendingRequests(normalized);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => loadData();

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTeam = () => {
    const teamId = deleteTeamId;
    if (!teamId) return;
    startTransition(async () => {
      try {
        const res = await deleteTeamAction(teamId);
        if (res.success) {
          toast("Team deleted.");
          refreshData();
        } else {
          toast(res.error || "Failed to delete team.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setDeleteTeamId(null);
      }
    });
  };

  const copyToClipboard = (link: string) => {
    const fullUrl = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(link);
      toast("Link copied to clipboard.");
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const balance = orgWallet ? Number(orgWallet.balance ?? 0) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage teams, funding, and approvals for your organization."
        action={
          <>
            <Button variant="secondary" onClick={() => setModal("invite")} icon={<Send className="w-[18px] h-[18px]" />}>
              Invite
            </Button>
            <Button onClick={() => setModal("team")} icon={<Plus className="w-[18px] h-[18px]" />}>
              New team
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
          </div>
          <SkeletonCard className="h-64" />
        </div>
      ) : error ? (
        <ErrorState onRetry={loadData} message="We couldn't load the dashboard. Please try again." />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              tone="brand"
              icon={<Coins className="w-5 h-5" />}
              label="Org wallet balance"
              value={`₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
            <StatCard icon={<Users className="w-5 h-5" />} label="Departments / teams" value={teams.length} />
            <StatCard
              icon={<CheckSquare className="w-5 h-5" />}
              label="Pending approvals"
              value={pendingRequests.length}
            />
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setModal("fund")} icon={<Coins className="w-[18px] h-[18px]" />}>
              Fund wallet
            </Button>
            <Button variant="secondary" onClick={() => setModal("support")} icon={<ShieldAlert className="w-[18px] h-[18px]" />}>
              Emergency support
            </Button>
          </div>

          {/* Approvals — the primary daily job, promoted to the top */}
          <ApprovalsQueue requests={pendingRequests} onRefresh={refreshData} />

          {/* Teams */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="t-h3 text-[var(--text)] flex items-center gap-2">
                <Building className="w-5 h-5 text-[var(--brand-bright)]" /> Departments &amp; teams
              </h3>
              <Button size="sm" variant="secondary" onClick={() => setModal("team")} icon={<Plus className="w-4 h-4" />}>
                New team
              </Button>
            </div>
            {teams.length === 0 ? (
              <EmptyState
                icon={<Building className="w-6 h-6" />}
                title="No teams yet"
                description="Create your first department to start onboarding employees."
                action={
                  <Button onClick={() => setModal("team")} icon={<Plus className="w-[18px] h-[18px]" />}>
                    New team
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] rounded-[var(--r)] border border-[var(--line)]"
                  >
                    <button
                      onClick={() => setViewTeam(t)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer group"
                    >
                      <span className="w-9 h-9 rounded-[var(--r-sm)] bg-[var(--brand-tint)] grid place-items-center text-[var(--brand-bright)] shrink-0">
                        <Building className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="t-small font-medium text-[var(--text)] group-hover:text-[var(--brand-bright)] transition-colors block truncate">
                          {t.name}
                        </span>
                        {t.description && (
                          <span className="t-caption text-[var(--muted)] block truncate">{t.description}</span>
                        )}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton aria-label="View team" onClick={() => setViewTeam(t)}>
                        <Eye className="w-4 h-4" />
                      </IconButton>
                      <IconButton aria-label="Edit team" onClick={() => setEditTeam(t)}>
                        <Edit className="w-4 h-4" />
                      </IconButton>
                      <IconButton aria-label="Delete team" onClick={() => setDeleteTeamId(t.id)}>
                        <Trash2 className="w-4 h-4 text-[var(--rose)]" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </>
      )}

      {/* Modals */}
      <CreateTeamModal open={modal === "team"} onClose={() => setModal(null)} onDone={() => { setModal(null); refreshData(); }} />
      <InviteEmployeeModal open={modal === "invite"} onClose={() => setModal(null)} teams={teams} />
      {adminUser && (
        <FundWalletModal
          open={modal === "fund"}
          onClose={() => setModal(null)}
          organizationId={adminUser.organizationId}
          teamWallets={teamWallets}
          orgWallet={orgWallet}
          onDone={() => { setModal(null); refreshData(); }}
        />
      )}
      <EmergencySupportModal
        open={modal === "support"}
        onClose={() => setModal(null)}
        teams={teams}
        onDone={() => { setModal(null); refreshData(); }}
      />
      <TeamDetailsModal team={viewTeam} onClose={() => setViewTeam(null)} />
      <EditTeamModal team={editTeam} onClose={() => setEditTeam(null)} onDone={() => { setEditTeam(null); refreshData(); }} />
      <ConfirmDialog
        open={!!deleteTeamId}
        onClose={() => setDeleteTeamId(null)}
        onConfirm={handleDeleteTeam}
        title="Delete team?"
        description="This permanently removes the team and its wallet association. This can't be undone."
        confirmLabel="Delete team"
      />
    </div>
  );
}
