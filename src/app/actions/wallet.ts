"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export async function getTransactionsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/transactions?limit=50`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) return [];

    const data = result.data || result;
    return Array.isArray(data) ? data : data.items || data.data || [];
  } catch (error) {
    console.error("Get transactions error:", error);
    return [];
  }
}

export async function getAdminTransactionsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/transactions/admin/all?limit=50`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) return [];

    const data = result.data || result;
    return Array.isArray(data) ? data : data.items || data.data || [];
  } catch (error) {
    console.error("Get admin transactions error:", error);
    return [];
  }
}

export async function updateBankProfileAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized." };
  }

  const bankCode = formData.get("bankCode")?.toString();
  const accountNumber = formData.get("accountNumber")?.toString().trim();

  if (!bankCode || !accountNumber) {
    return { success: false, error: "Bank and account number are required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/bank-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bankCode, accountNumber }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to update bank profile." };
    }

    return { success: true };
  } catch (error) {
    console.error("Update bank profile error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function listBanksAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/banks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) return [];

    return result.data || result || [];
  } catch (error) {
    console.error("List banks error:", error);
    return [];
  }
}

export async function requestWithdrawalAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized." };
  }

  const amountStr = formData.get("amount")?.toString();
  if (!amountStr) {
    return { success: false, error: "Amount is required." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid positive amount." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to request withdrawal." };
    }

    return { success: true };
  } catch (error) {
    console.error("Request withdrawal error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function fundOrgWalletAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized." };
  }

  const organizationId = formData.get("organizationId")?.toString();
  const amountStr = formData.get("amount")?.toString();

  if (!organizationId || !amountStr) {
    return { success: false, error: "Organization and amount are required." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid positive amount." };
  }

  // Generate a random reference for the demo sandbox funding
  const reference = `fund-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/fund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        organizationId,
        amount,
        reference,
        metadata: { source: "frontend_demo" },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to fund wallet." };
    }

    return { success: true };
  } catch (error) {
    console.error("Fund organization wallet error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function listTeamWalletsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/teams`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) return [];

    return result.data || result || [];
  } catch (error) {
    console.error("List team wallets error:", error);
    return [];
  }
}

export async function getTeamWalletAction(teamId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token || !teamId) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/team/${teamId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) return null;

    return result.data || result || null;
  } catch (error) {
    console.error("Get team wallet error:", error);
    return null;
  }
}

export async function getUserWalletAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/user`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return null;
    return result.data || result || null;
  } catch (err) {
    console.error("Get user wallet error:", err);
    return null;
  }
}

export async function fundTeamWalletAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const teamId = formData.get("teamId")?.toString();
  const amountStr = formData.get("amount")?.toString();

  if (!teamId || !amountStr) {
    return { success: false, error: "Team and amount are required" };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid amount" };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/team/fund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ teamId, amount })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fund team wallet" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function fundTeamWalletExternalAction(teamId: string, amount: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/team/${teamId}/fund-external`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to perform external funding" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function redeemPointsAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const amountStr = formData.get("amount")?.toString();
  const type = formData.get("type")?.toString();
  const phoneNumber = formData.get("phoneNumber")?.toString();
  const provider = formData.get("provider")?.toString();
  const dataCode = formData.get("dataCode")?.toString();

  if (!amountStr || !type) {
    return { success: false, error: "Amount and type are required" };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid points amount" };
  }

  const payload: any = { amount, type };
  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (provider) payload.provider = provider;
  if (dataCode) payload.dataCode = dataCode;

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/redeem-points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to redeem points" };
    return { success: true, result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function disburseEmergencySupportAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const recipientId = formData.get("recipientId")?.toString();
  const category = formData.get("category")?.toString();

  if (!recipientId || !category) {
    return { success: false, error: "Recipient and category are required" };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/emergency-support`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recipientId, category })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to disburse emergency support" };
    return { success: true, request: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function approveRewardRequestAction(requestId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/approve-request/${requestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to approve request" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function rejectRewardRequestAction(requestId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/reject-request/${requestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to reject request" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getBudgetUtilizationAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/budget-utilization`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return null;
    const payload = result.data || result || null;
    if (!payload) return null;

    if (payload.organization && Array.isArray(payload.teams)) {
      return payload;
    }

    const teamReports = Array.isArray(payload.teamsReport) ? payload.teamsReport : [];
    const teamSpent = teamReports.reduce(
      (sum: number, team: { spentAmount?: number | string }) => sum + Number(team.spentAmount || 0),
      0,
    );
    const teamHeld = teamReports.reduce(
      (sum: number, team: { heldBalance?: number | string }) => sum + Number(team.heldBalance || 0),
      0,
    );
    const teamAvailable = teamReports.reduce(
      (sum: number, team: { availableBalance?: number | string }) => sum + Number(team.availableBalance || 0),
      0,
    );
    const teamBalances = teamReports.reduce(
      (sum: number, team: { balance?: number | string }) => sum + Number(team.balance || 0),
      0,
    );
    const orgBalance = Number(payload.orgWallet?.balance || 0);
    const orgHeld = Number(payload.orgWallet?.heldBalance || 0);
    const orgAvailable = Number(payload.orgWallet?.availableBalance || 0);

    return {
      organization: {
        totalBudget: orgBalance + teamBalances + teamSpent,
        spentBudget: teamSpent,
        heldBudget: orgHeld + teamHeld,
        availableBalance: orgAvailable + teamAvailable,
      },
      teams: teamReports.map((team: {
        teamId: string;
        teamName: string;
        balance?: number | string;
        heldBalance?: number | string;
        availableBalance?: number | string;
        spentAmount?: number | string;
      }) => ({
        teamId: team.teamId,
        teamName: team.teamName,
        budget: Number(team.balance || 0) + Number(team.spentAmount || 0),
        spent: Number(team.spentAmount || 0),
        held: Number(team.heldBalance || 0),
        available: Number(team.availableBalance || 0),
      })),
    };
  } catch (err) {
    console.error("Get budget utilization error:", err);
    return null;
  }
}

export async function getFraudAlertsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/fraud-alerts`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return [];
    return result.alerts || result.data || result || [];
  } catch (err) {
    console.error("Get fraud alerts error:", err);
    return [];
  }
}

export async function resolveFraudAlertAction(alertId: string, status: "RESOLVED" | "FALSE_POSITIVE") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/fraud-alerts/${alertId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to resolve fraud alert" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getRewardRequestsAction(status?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return [];

  try {
    const url = new URL(`${BACKEND_URL}/wallet/requests`);
    if (status) url.searchParams.append("status", status);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return [];
    return result.requests || result.data || result || [];
  } catch (err) {
    console.error("Get reward requests error:", err);
    return [];
  }
}

export async function createWorkflowRuleAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const category = formData.get("category")?.toString().trim();
  const minAmount = Number(formData.get("minAmount"));
  const maxAmount = Number(formData.get("maxAmount"));
  const stagesRaw = formData.get("stages")?.toString();
  const stages = stagesRaw ? stagesRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!category || isNaN(minAmount) || isNaN(maxAmount) || stages.length === 0) {
    return { success: false, error: "Required fields are missing or invalid" };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/workflow-rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ category, minAmount, maxAmount, stages })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to create rule" };
    return { success: true, rule: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function listWorkflowRulesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/workflow-rules`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return [];
    return result.rules || result.data || result || [];
  } catch (err) {
    console.error("List workflow rules error:", err);
    return [];
  }
}
