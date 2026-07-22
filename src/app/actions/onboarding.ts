"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export async function createTeamAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const size = formData.get("size")?.toString().trim();

  if (!name) {
    return { success: false, error: "Team name is required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description: description || undefined,
        size: size || undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to create team." };
    }

    return { success: true, team: result.data?.team || result.team };
  } catch (error) {
    console.error("Create team action error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function inviteUserAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const email = formData.get("email")?.toString().trim();
  const teamId = formData.get("teamId")?.toString().trim();
  const role = formData.get("role")?.toString().trim();

  if (!email || !role) {
    return { success: false, error: "Email and role are required." };
  }

  if (role !== "ADMIN" && !teamId) {
    return { success: false, error: "Team is required for team members and leaders." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        teamId: role === "ADMIN" ? undefined : teamId,
        role,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to generate invite." };
    }

    const inviteData = result.data || result;
    const backendInviteLink = inviteData.inviteLink;
    const tokenParam = inviteData.token;

    const frontendInviteLink = `/register?token=${tokenParam}`;

    return {
      success: true,
      inviteLink: frontendInviteLink,
      email: inviteData.email,
      role: inviteData.role,
      expiresAt: inviteData.expiresAt,
    };
  } catch (error) {
    console.error("Invite user action error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function getTeamsAction(search?: string, page = 1, limit = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const url = new URL(`${BACKEND_URL}/teams`);
    if (search) url.searchParams.append("search", search);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch teams." };
    return { success: true, teams: result.teams || result.data?.teams, total: result.total, page: result.page, limit: result.limit };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function getTeamDetailsAction(teamId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/teams/${teamId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch team details." };
    const team = result.data || result;
    if (team) {
      team.users = team.teamMembers || team.users || [];
    }
    return { success: true, team };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function updateTeamAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const teamId = formData.get("teamId")?.toString();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const size = formData.get("size")?.toString().trim();

  if (!teamId || !name) {
    return { success: false, error: "Team ID and name are required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/teams/${teamId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, size }),
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to update team." };
    return { success: true, team: result.data || result };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function deleteTeamAction(teamId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/teams/${teamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to delete team." };
    return { success: true, message: result.message || "Team deleted successfully." };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function addTeamMemberAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const teamId = formData.get("teamId")?.toString();
  const email = formData.get("email")?.toString().trim();

  if (!teamId || !email) {
    return { success: false, error: "Team ID and email are required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/teams/${teamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to add member to team." };
    return { success: true, team: result.data || result };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function updateOrgSettingsAction(pointToAmountValue: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/organization/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pointToAmountValue }),
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to update organization settings." };
    return { success: true, organization: result.organization || result };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}

export async function reserveAccountAction(bvn: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/organization/reserve-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bvn }),
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to reserve account." };
    return { success: true, reservedAccountDetails: result.data?.reservedAccountDetails || result.reservedAccountDetails || result };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Connection error" };
  }
}
