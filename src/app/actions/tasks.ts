"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export async function createTaskAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized." };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const priority = formData.get("priority")?.toString() || "MEDIUM";
  const dueDate = formData.get("dueDate")?.toString();
  const challengeId = formData.get("challengeId")?.toString().trim();

  if (!title || !description || !dueDate) {
    return { success: false, error: "Title, description, and due date are required." };
  }

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    return { success: false, error: "Please select a valid task priority." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        challengeId: challengeId || undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to create task." };
    }

    return { success: true, task: result.data || result };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function getMyTasksAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/my-tasks?limit=50`, {
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
    console.error("Get my tasks error:", error);
    return [];
  }
}

export async function getTeamTasksAction(teamId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token || !teamId) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/team/${teamId}?limit=50`, {
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
    console.error("Get team tasks error:", error);
    return [];
  }
}

export async function completeTaskAction(taskId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to complete task." };
    }

    return { success: true };
  } catch (error) {
    console.error("Complete task error:", error);
    return { success: false, error: "Failed to connect to backend server." };
  }
}

export async function updateTaskAction(taskId: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const priority = formData.get("priority")?.toString();
  const dueDate = formData.get("dueDate")?.toString();
  const challengeId = formData.get("challengeId")?.toString().trim();

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        challengeId: challengeId || undefined
      })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to update task" };
    return { success: true, task: result };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to delete task" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getTasksForReviewAction(status = "COMPLETED", page = 1, limit = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/review?status=${status}&page=${page}&limit=${limit}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return [];
    const data = result.data || result;
    return Array.isArray(data) ? data : data.items || data.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function approveTaskAction(taskId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to approve task" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function rejectTaskAction(taskId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message || "Failed to reject task" };
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Connection error" };
  }
}

export async function getAllTasksAction(status?: string, page = 1, limit = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return [];

  try {
    const url = new URL(`${BACKEND_URL}/tasks`);
    if (status) url.searchParams.append("status", status);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (!response.ok) return [];
    const data = result.data || result;
    return Array.isArray(data) ? data : data.items || data.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}
