"use client";

import { getMeAction, getOrgWalletAction } from "@/app/actions/auth";
import {
  createTeamAction,
  inviteUserAction,
  getTeamsAction,
  getTeamDetailsAction,
  updateTeamAction,
  deleteTeamAction,
  addTeamMemberAction
} from "@/app/actions/onboarding";
import {
  listTeamWalletsAction,
  fundTeamWalletAction,
  fundOrgWalletAction,
  disburseEmergencySupportAction,
  getRewardRequestsAction,
  approveRewardRequestAction,
  rejectRewardRequestAction
} from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import {
  Building,
  Check,
  Coins,
  Copy,
  Plus,
  PlusCircle,
  Send,
  UserCheck,
  Users,
  Edit,
  Trash2,
  X,
  UserPlus,
  CheckSquare,
  XCircle,
  ShieldAlert,
  User
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";

type Team = {
  id: string;
  name: string;
  description?: string;
  size?: string;
};

type Invite = {
  email: string;
  role: string;
  inviteLink: string;
  teamName: string;
  expiresAt: string;
};

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [orgWallet, setOrgWallet] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState("");
  const [inviteRole, setInviteRole] = useState("TEAM_MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Team Management states
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSize, setEditSize] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  // Wallet / Workflow states
  const [teamWallets, setTeamWallets] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [fundTeamId, setFundTeamId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundTeamLoading, setFundTeamLoading] = useState(false);
  const [fundOrgAmount, setFundOrgAmount] = useState("");
  const [fundOrgLoading, setFundOrgLoading] = useState(false);

  const [supportRecipientId, setSupportRecipientId] = useState("");
  const [supportCategory, setSupportCategory] = useState("MEDICAL");
  const [supportLoading, setSupportLoading] = useState(false);

  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const { celebrate, toast } = useToast();

  const refreshData = async (orgId: string) => {
    try {
      const wallet = await getOrgWalletAction(orgId);
      if (wallet) setOrgWallet(wallet);

      const walletList = await listTeamWalletsAction();
      if (walletList) setTeamWallets(walletList);

      const requestsResult = await getRewardRequestsAction("PENDING");
      if (requestsResult) {
        const normalized = Array.isArray(requestsResult)
          ? requestsResult
          : (requestsResult.requests || requestsResult.data || []);
        setPendingRequests(normalized);
      }
    } catch (e) {
      console.error("Failed to refresh admin data:", e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const me = await getMeAction();
        if (me) {
          setAdminUser(me);
          
          // Load teams from backend teams API
          const teamsResult = await getTeamsAction();
          if (teamsResult.success && teamsResult.teams && teamsResult.teams.length > 0) {
            setTeams(teamsResult.teams);
            setInviteTeamId(teamsResult.teams[0].id);
          } else {
            const walletList = await listTeamWalletsAction();
            if (walletList && walletList.length > 0) {
              const loadedTeams = walletList.map((w: any) => ({
                id: w.team.id,
                name: w.team.name,
                description: w.team.description,
              }));
              setTeams(loadedTeams);
              setInviteTeamId(loadedTeams[0].id);
            } else if (me.team) {
              setTeams([{ id: me.team.id, name: me.team.name }]);
              setInviteTeamId(me.team.id);
            }
          }

          const wallet = await getOrgWalletAction(me.organizationId);
          if (wallet) {
            setOrgWallet(wallet);
          }

          const walletList = await listTeamWalletsAction();
          if (walletList) {
            setTeamWallets(walletList);
            if (walletList.length > 0 && !fundTeamId) {
              setFundTeamId(walletList[0].team.id);
            }
          }

          const requestsResult = await getRewardRequestsAction("PENDING");
          if (requestsResult) {
            const normalized = Array.isArray(requestsResult)
              ? requestsResult
              : (requestsResult.requests || requestsResult.data || []);
            setPendingRequests(normalized);
          }
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Retrieve locally saved invite links
    const savedInvites = localStorage.getItem("prodily_invites");
    if (savedInvites) {
      try {
        setInvites(JSON.parse(savedInvites));
      } catch (e) {
        console.error("Failed to parse saved invites:", e);
      }
    }
  }, []);

  const handleFundTeamWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundTeamId || !fundAmount) return;

    setFundTeamLoading(true);
    const formData = new FormData();
    formData.append("teamId", fundTeamId);
    formData.append("amount", fundAmount);

    startTransition(async () => {
      try {
        const res = await fundTeamWalletAction(null, formData);
        if (res.success) {
          celebrate("Team wallet successfully funded!");
          setFundAmount("");
          if (adminUser) refreshData(adminUser.organizationId);
        } else {
          toast(res.error || "Failed to fund team wallet.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setFundTeamLoading(false);
      }
    });
  };

  const handleFundOrgWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser || !fundOrgAmount) return;

    setFundOrgLoading(true);
    const formData = new FormData();
    formData.append("organizationId", adminUser.organizationId);
    formData.append("amount", fundOrgAmount);

    startTransition(async () => {
      try {
        const res = await fundOrgWalletAction(null, formData);
        if (res.success) {
          celebrate("Organization wallet funded successfully!");
          setFundOrgAmount("");
          refreshData(adminUser.organizationId);
        } else {
          toast(res.error || "Failed to fund organization wallet.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setFundOrgLoading(false);
      }
    });
  };

  const handleDisburseEmergencySupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportRecipientId || !supportCategory) return;

    setSupportLoading(true);
    const formData = new FormData();
    formData.append("recipientId", supportRecipientId);
    formData.append("category", supportCategory);

    startTransition(async () => {
      try {
        const res = await disburseEmergencySupportAction(null, formData);
        if (res.success) {
          celebrate("Support disbursement successfully created!");
          setSupportRecipientId("");
          if (adminUser) refreshData(adminUser.organizationId);
        } else {
          toast(res.error || "Failed to disburse support.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setSupportLoading(false);
      }
    });
  };

  const handleApproveRequest = async (requestId: string) => {
    startTransition(async () => {
      try {
        const res = await approveRewardRequestAction(requestId);
        if (res.success) {
          celebrate("Request approved successfully!");
          if (adminUser) refreshData(adminUser.organizationId);
        } else {
          toast(res.error || "Failed to approve request.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectRequestId || !rejectReason) return;

    setRejectLoading(true);
    startTransition(async () => {
      try {
        const res = await rejectRewardRequestAction(rejectRequestId, rejectReason);
        if (res.success) {
          celebrate("Request rejected successfully.");
          setRejectRequestId(null);
          setRejectReason("");
          if (adminUser) refreshData(adminUser.organizationId);
        } else {
          toast(res.error || "Failed to reject request.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setRejectLoading(false);
      }
    });
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    setTeamLoading(true);
    const formData = new FormData();
    formData.append("name", teamName);
    formData.append("description", teamDesc);
    formData.append("size", teamSize);

    startTransition(async () => {
      try {
        const res = await createTeamAction(null, formData);
        if (res.success && res.team) {
          celebrate(`Team "${res.team.name}" created successfully!`);
          const newTeam: Team = {
            id: res.team.id,
            name: res.team.name,
            description: res.team.description,
            size: res.team.size,
          };
          setTeams((prev) => [...prev, newTeam]);
          if (!inviteTeamId) setInviteTeamId(newTeam.id);

          // Reset form
          setTeamName("");
          setTeamDesc("");
          setTeamSize("");
        } else {
          toast(res.error || "Failed to create team.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setTeamLoading(false);
      }
    });
  };

  const handleViewTeamDetails = async (team: Team) => {
    setSelectedTeam(team);
    setTeamMembers([]);
    try {
      const res = await getTeamDetailsAction(team.id);
      if (res.success && res.team) {
        setSelectedTeam(res.team);
        setTeamMembers(res.team.users || []);
      }
    } catch (err) {
      toast("Failed to load team members.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !memberEmail) return;
    setMemberLoading(true);

    const formData = new FormData();
    formData.append("teamId", selectedTeam.id);
    formData.append("email", memberEmail);

    startTransition(async () => {
      try {
        const res = await addTeamMemberAction(null, formData);
        if (res.success) {
          celebrate("Member successfully added to team!");
          setMemberEmail("");
          handleViewTeamDetails(selectedTeam);
        } else {
          toast(res.error || "Failed to add member.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setMemberLoading(false);
      }
    });
  };

  const handleStartEdit = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditDescription(team.description || "");
    setEditSize(team.size || "");
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    const formData = new FormData();
    formData.append("teamId", editingTeam.id);
    formData.append("name", editName);
    formData.append("description", editDescription);
    formData.append("size", editSize);

    startTransition(async () => {
      try {
        const res = await updateTeamAction(null, formData);
        if (res.success) {
          celebrate("Team updated successfully!");
          setEditingTeam(null);
          const teamsRes = await getTeamsAction();
          if (teamsRes.success && teamsRes.teams) {
            setTeams(teamsRes.teams);
          }
        } else {
          toast(res.error || "Failed to update team.");
        }
      } catch (err) {
        toast("Connection error.");
      }
    });
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const res = await deleteTeamAction(teamId);
      if (res.success) {
        celebrate("Team deleted successfully!");
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }
        const teamsRes = await getTeamsAction();
        if (teamsRes.success && teamsRes.teams) {
          setTeams(teamsRes.teams);
        } else {
          setTeams([]);
        }
      } else {
        toast(res.error || "Failed to delete team.");
      }
    } catch (err) {
      toast("Connection error.");
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRole) return;
    if (inviteRole !== "ADMIN" && !inviteTeamId) return;

    setInviteLoading(true);
    const formData = new FormData();
    formData.append("email", inviteEmail);
    if (inviteRole !== "ADMIN") {
      formData.append("teamId", inviteTeamId);
    }
    formData.append("role", inviteRole);

    startTransition(async () => {
      try {
        const res = await inviteUserAction(null, formData);
        if (res.success && res.inviteLink) {
          celebrate("Invitation token generated!");
          const targetTeam = inviteRole === "ADMIN" ? null : teams.find((t) => t.id === inviteTeamId);
          const newInvite: Invite = {
            email: res.email,
            role: res.role,
            inviteLink: res.inviteLink,
            teamName: targetTeam ? targetTeam.name : "Organization Admin",
            expiresAt: res.expiresAt,
          };
          setInvites((prev) => {
            const updated = [newInvite, ...prev];
            localStorage.setItem("prodily_invites", JSON.stringify(updated));
            return updated;
          });
          setInviteEmail("");
        } else {
          toast(res.error || "Failed to generate invite.");
        }
      } catch (err) {
        toast("Connection error.");
      } finally {
        setInviteLoading(false);
      }
    });
  };

  const copyToClipboard = (link: string) => {
    const fullUrl = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(link);
      toast("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 bg-white/80 p-8 rounded-[32px] border border-[var(--line)] shadow-[var(--sh)]">
          <span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
          <span className="font-semibold text-sm text-[var(--ink)]">Loading workspace dashboard...</span>
        </div>
      </div>
    );
  }

  const balance = orgWallet ? orgWallet.balance : 0.0;

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--indigo-tint)] grid place-items-center text-[var(--indigo)]">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Org Wallet Balance</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">
              ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--violet-tint)] grid place-items-center text-[var(--violet)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Departments / Teams</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">{teams.length}</div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[22px] p-5 shadow-[var(--sh-sm)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[var(--mint-tint)] grid place-items-center text-[var(--mint)]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12.5px] text-[var(--muted)] font-medium">Invitations Issued</div>
            <div className="font-display font-bold text-2xl text-[var(--ink)]">{invites.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Onboarding Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Create Team */}
        <div className="bg-white/90 backdrop-blur-md border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[var(--indigo)]" /> Create Department / Team
            </h3>
            <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
              Provision a new department or team along with a dedicated Team Wallet.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="teamName">
                  Team Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  required
                  placeholder="e.g. Design, Frontend Engineering"
                  className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="teamDesc">
                    Description
                  </label>
                  <input
                    id="teamDesc"
                    type="text"
                    placeholder="Sub-budget details"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                  />
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="teamSize">
                    Est. Size
                  </label>
                  <input
                    id="teamSize"
                    type="number"
                    placeholder="10"
                    min="1"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={teamLoading}
                  className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {teamLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Team
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of Created Teams in the Session */}
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-2.5">
              Available Teams ({teams.length})
            </h4>
            {teams.length === 0 ? (
              <p className="text-xs text-[var(--faint)] italic">No teams created yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-[var(--violet-tint)]/30 hover:bg-[var(--violet-tint)]/60 rounded-2xl border border-purple-100/50 shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleViewTeamDetails(t)}>
                      <div className="w-8 h-8 rounded-xl bg-[var(--violet-tint)] grid place-items-center text-[var(--violet)]">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--indigo)] transition-colors">
                          {t.name}
                        </div>
                        {t.description && (
                          <div className="text-[10px] text-[var(--muted)] font-medium truncate max-w-[150px]">
                            {t.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleViewTeamDetails(t)}
                        className="p-1.5 hover:bg-white rounded-lg text-[var(--indigo)] transition-all cursor-pointer"
                        title="View Details & Members"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 hover:bg-white rounded-lg text-amber-600 transition-all cursor-pointer"
                        title="Edit Team"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(t.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-rose-600 transition-all cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Generate Employee Invite */}
        <div className="bg-white/90 backdrop-blur-md border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-[var(--indigo)]" /> Invite Employee
            </h3>
            <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
              Generate a cryptographically signed invitation link for an employee.
            </p>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="inviteEmail">
                  Work Email Address
                </label>
                <input
                  id="inviteEmail"
                  type="email"
                  required
                  placeholder="employee@company.com"
                  className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1 animate-fade-in" htmlFor="inviteTeam">
                    Assign to Team
                  </label>
                  <select
                    id="inviteTeam"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none disabled:opacity-50"
                    value={inviteRole === "ADMIN" ? "" : inviteTeamId}
                    onChange={(e) => setInviteTeamId(e.target.value)}
                    required={inviteRole !== "ADMIN"}
                    disabled={inviteRole === "ADMIN"}
                  >
                    {inviteRole === "ADMIN" ? (
                      <option value="">N/A (Organization Admin)</option>
                    ) : (
                      <>
                        <option value="" disabled>Select Team</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="inviteRole">
                    Workspace Role
                  </label>
                  <select
                    id="inviteRole"
                    className="w-full bg-white/70 border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] focus:bg-white transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    required
                  >
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="TEAM_LEAD">Team Lead</option>
                    <option value="ADMIN">HR Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={inviteLoading || (inviteRole !== "ADMIN" && teams.length === 0)}
                  className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {inviteLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generate Invite Link
                    </>
                  )}
                </button>
                {inviteRole !== "ADMIN" && teams.length === 0 && (
                  <span className="text-[10px] text-[var(--rose)] font-bold mt-1 text-center block">
                    Please create at least one team first.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Invites Issued Display */}
      {invites.length > 0 && (
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] animate-fade-in">
          <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[var(--mint)]" /> Generated Onboarding Links
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Email</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Team</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Invitation Link</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite, i) => (
                  <tr key={i} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-4 text-sm font-semibold text-[var(--ink)]">{invite.email}</td>
                    <td className="py-4 text-xs font-bold text-[var(--violet)]">
                      <span className="px-2 py-0.5 bg-[var(--violet-tint)] rounded-md border border-purple-100">
                        {invite.teamName}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-bold text-[var(--muted)] uppercase">{invite.role.replace("_", " ")}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-1.5 rounded-lg border max-w-[200px] truncate">
                          {invite.inviteLink}
                        </span>
                        <button
                          onClick={() => copyToClipboard(invite.inviteLink)}
                          className="p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] hover:bg-indigo-50 text-[var(--indigo)] transition-all cursor-pointer flex-shrink-0"
                          title="Copy Link to Clipboard"
                        >
                          {copiedLink === invite.inviteLink ? (
                            <Check className="w-4 h-4 text-[var(--mint)]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={invite.inviteLink}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--indigo-tint)] text-[var(--indigo-700)] text-xs font-bold border border-indigo-200 hover:bg-[var(--indigo)] hover:text-white transition-all text-center flex-shrink-0"
                          title="Open onboarding in a new window"
                        >
                          Launch Link
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wallet Management & Emergency Support Disbursements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Panel: Wallet Funding */}
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[var(--indigo)]" /> Wallet Management
            </h3>
            <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
              Simulate funding the corporate wallet or distribute budget to departments.
            </p>

            <div className="space-y-6">
              {/* Fund Org Wallet */}
              <form onSubmit={handleFundOrgWallet} className="space-y-3 pb-6 border-b border-[var(--line)]">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1 text-left">
                  Fund Corporate Organization Wallet
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="Amount (NGN) e.g. 50000"
                    className="flex-1 bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={fundOrgAmount}
                    onChange={(e) => setFundOrgAmount(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={fundOrgLoading}
                    className="bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer whitespace-nowrap"
                  >
                    {fundOrgLoading ? "Funding..." : "Fund Org"}
                  </button>
                </div>
              </form>

              {/* Fund Team Wallet */}
              <form onSubmit={handleFundTeamWallet} className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1 text-left">
                  Allocate Budget to Department/Team
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider pl-1 block mb-1 text-left">
                      Select Department
                    </label>
                    <select
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={fundTeamId}
                      onChange={(e) => setFundTeamId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Department</option>
                      {teamWallets.map((w: any) => (
                        <option key={w.team.id} value={w.team.id}>
                          {w.team.name} (Bal: ₦{w.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider pl-1 block mb-1 text-left">
                      Allocation Amount
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 10000"
                      className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={fundTeamLoading || teamWallets.length === 0}
                  className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {fundTeamLoading ? "Transferring..." : "Allocate Budget"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel: Disburse Emergency Support */}
        <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-[20px] text-[var(--ink)] mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--indigo)]" /> Emergency Support
            </h3>
            <p className="text-[13px] text-[var(--muted)] font-medium mb-5">
              Disburse direct assistance to an employee. Submits for workflow sign-off chain.
            </p>

            <form onSubmit={handleDisburseEmergencySupport} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="supportRecipient">
                  Recipient User ID (UUID)
                </label>
                <input
                  id="supportRecipient"
                  type="text"
                  required
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={supportRecipientId}
                  onChange={(e) => setSupportRecipientId(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="supportCategory">
                  Support Category / Reason
                </label>
                <select
                  id="supportCategory"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] appearance-none"
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  required
                >
                  <option value="MEDICAL">Medical</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="LUNCH">Lunch</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={supportLoading}
                className="w-full bg-[var(--indigo)] hover:bg-[var(--indigo-600)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
              >
                {supportLoading ? "Disbursing..." : "Disburse Support Request"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Pending Approvals Workflow Queue */}
      <div className="bg-white border border-[var(--line)] rounded-[26px] p-6 shadow-[var(--sh-sm)] animate-fade-in">
        <h3 className="font-display font-extrabold text-[18px] text-[var(--ink)] mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[var(--indigo)]" /> Workflow Approvals Queue
        </h3>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 bg-[var(--surface-2)] rounded-[20px] border border-dashed border-[var(--line)]">
            <CheckSquare className="w-8 h-8 text-[var(--faint)] mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] font-semibold">No pending requests await your sign-off.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Requester</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Recipient</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Stages</th>
                  <th className="pb-3 text-xs font-bold text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {req.requestor ? `${req.requestor.firstName} ${req.requestor.lastName}` : "Admin"}
                    </td>
                    <td className="py-4 text-xs font-bold text-[var(--ink)]">
                      {req.recipient ? `${req.recipient.firstName} ${req.recipient.lastName}` : "User"}
                    </td>
                    <td className="py-4 text-xs font-semibold">
                      <span className="px-2.5 py-1 bg-[var(--violet-tint)] text-[var(--violet)] rounded-full border border-purple-100 uppercase tracking-wide text-[10px] font-bold">
                        {req.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-[var(--ink)]">
                      ₦{Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-xs text-[var(--muted)] font-medium">
                      {req.approvalStages?.join(" → ") || "Auto-Approve"} (Stage: {req.currentStageIndex})
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-3 py-1.5 bg-[var(--mint-tint)] hover:bg-mint text-[var(--mint)] hover:text-white rounded-lg text-xs font-bold border border-green-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectRequestId(req.id)}
                          className="px-3 py-1.5 bg-[var(--rose-tint)] hover:bg-rose-600 text-[var(--rose)] hover:text-white rounded-lg text-xs font-bold border border-red-200 hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectRequestId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[var(--line)] p-6 w-full max-w-md shadow-[var(--sh)] relative overflow-hidden animate-fade-in text-left">
            <h3 className="font-display font-extrabold text-xl text-[var(--ink)] mb-2 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-[var(--rose)]" /> Reject Approval Request
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Please provide a clear reason for rejecting this disbursement.
            </p>
            <form onSubmit={handleRejectRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="rejectReason">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectReason"
                  required
                  rows={3}
                  placeholder="e.g. Budget constraints, incorrect categorization..."
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectRequestId(null)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-bold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="flex-1 bg-[var(--rose)] hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  {rejectLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[var(--line)] p-6 w-full max-w-lg shadow-[var(--sh)] relative overflow-hidden animate-fade-in">
            <div className="absolute w-[200px] h-[200px] rounded-full bg-[var(--indigo-tint)] -top-[100px] -left-[100px] opacity-40 pointer-events-none" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="text-left">
                <h3 className="font-display font-extrabold text-2xl text-[var(--ink)] flex items-center gap-2">
                  <Building className="w-6 h-6 text-[var(--indigo)]" /> {selectedTeam.name}
                </h3>
                {selectedTeam.description && (
                  <p className="text-[13px] text-[var(--muted)] font-medium mt-1">
                    {selectedTeam.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--line)] grid place-items-center hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--ink)]" />
              </button>
            </div>

            {/* Members list */}
            <div className="mt-6 space-y-4 relative z-10">
              <div className="border-t border-[var(--line)] pt-4">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                  <Users className="w-4 h-4 text-[var(--violet)]" /> Team Members ({teamMembers.length})
                </h4>

                {teamMembers.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic text-center py-4 bg-[var(--surface-2)] rounded-2xl">
                    No employees assigned to this team yet. Invite them to join.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {teamMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] rounded-xl border border-[var(--line)]"
                      >
                        <div className="text-left">
                          <div className="text-xs font-bold text-[var(--ink)]">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">{m.email}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-[var(--indigo-tint)] text-[var(--indigo)] text-[10px] font-bold rounded">
                          {m.userRole.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add member form */}
              <form onSubmit={handleAddMember} className="border-t border-[var(--line)] pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-1.5 text-left">
                  <UserPlus className="w-4 h-4 text-[var(--indigo)]" /> Add Member to Team
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="employee@company.com"
                    className="flex-1 bg-white border border-[var(--line)] rounded-xl px-4 py-2 outline-none focus:border-[var(--indigo)] transition-all font-body text-xs text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={memberLoading}
                    className="bg-[var(--indigo)] hover:bg-[var(--indigo-600)] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    {memberLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--muted)] pl-1 text-left">
                  Note: The user must already be onboarded to your organization first.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[var(--line)] p-6 w-full max-w-md shadow-[var(--sh)] relative overflow-hidden animate-fade-in">
            <div className="absolute w-[200px] h-[200px] rounded-full bg-[var(--indigo-tint)] -top-[100px] -left-[100px] opacity-40 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="text-left">
                <h3 className="font-display font-extrabold text-2xl text-[var(--ink)] flex items-center gap-2">
                  <Building className="w-6 h-6 text-[var(--indigo)]" /> Edit Team
                </h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--line)] grid place-items-center hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--ink)]" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="mt-6 space-y-4 relative z-10">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="editName">
                  Team Name
                </label>
                <input
                  id="editName"
                  type="text"
                  required
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="editDesc">
                  Description
                </label>
                <textarea
                  id="editDesc"
                  rows={3}
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)] resize-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider pl-1" htmlFor="editSize">
                  Estimated Size
                </label>
                <input
                  id="editSize"
                  type="text"
                  className="w-full bg-white border border-[var(--line)] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--indigo)] transition-all font-body text-sm text-[var(--ink)] font-medium shadow-[var(--sh-sm)]"
                  placeholder="e.g. 10"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--indigo)] hover:bg-[var(--indigo-600)] text-white font-bold py-3 px-4 rounded-xl shadow-[var(--sh-indigo)] hover:translate-y-[-1px] transition-all cursor-pointer font-body text-xs uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
