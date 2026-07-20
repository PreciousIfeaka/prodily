"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export async function getActiveChallengesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/challenges/active`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch active challenges" };
    return { success: true, challenges: result.challenges || result.data || result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function createChallengeAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const rewardPoints = Number(formData.get("rewardPoints"));
  const totalBudget = Number(formData.get("totalBudget"));
  const startDate = formData.get("startDate")?.toString();
  const endDate = formData.get("endDate")?.toString();
  
  const teamIdsRaw = formData.get("teamIds")?.toString();
  const teamIds = teamIdsRaw ? teamIdsRaw.split(",").map(id => id.trim()).filter(Boolean) : [];

  if (!name || !category || !rewardPoints || !totalBudget || !startDate || !endDate) {
    return { success: false, error: "Required fields are missing" };
  }

  const payload: any = {
    name,
    category,
    teamIds,
    startDate,
    endDate,
    rewardPoints,
    totalBudget
  };

  try {
    const response = await fetch(`${BACKEND_URL}/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to create challenge" };
    return { success: true, challenge: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function claimAttendanceRewardAction(challengeId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/challenges/${challengeId}/claim-attendance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to claim reward" };
    return { success: true, result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getDashboardAnalyticsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/challenges/dashboard-analytics`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch dashboard analytics" };
    return { success: true, data: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getWeeklyLeaderboardAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/challenges/weekly-leaderboard`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch leaderboard" };
    return { success: true, leaderboard: result.leaderboard || result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function clockAction(action: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT") {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/time-tracking/clock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to update clock status" };
    return { success: true, session: result.session || result.data || result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function logManualTimeAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const taskId = formData.get("taskId")?.toString() || undefined;
  const date = formData.get("date")?.toString();
  const durationHours = Number(formData.get("durationHours"));
  const description = formData.get("description")?.toString() || undefined;
  const startTime = formData.get("startTime")?.toString() || undefined;
  const endTime = formData.get("endTime")?.toString() || undefined;

  if (!date || !durationHours) {
    return { success: false, error: "Date and duration are required" };
  }

  const payload = { taskId, date, durationHours, description, startTime, endTime };

  try {
    const response = await fetch(`${BACKEND_URL}/time-tracking/log-manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to log manual time" };
    return { success: true, entry: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getMyTimeEntriesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/time-tracking/my-entries`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch time entries" };
    return { success: true, entries: result.entries || result.data || result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getTeamTimeEntriesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/time-tracking/team-entries`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to fetch team time entries" };
    return { success: true, entries: result.entries || result.data || result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getActiveSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/time-tracking/active-session`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return null;
    return result.session || result.data || result || null;
  } catch (err) {
    console.error("Get active session error:", err);
    return null;
  }
}
