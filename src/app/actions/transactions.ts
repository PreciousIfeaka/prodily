"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export type TransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED";

export interface TransactionRecord {
  id: string;
  amount: number | string;
  type: "CREDIT" | "DEBIT";
  purpose?: string;
  status: TransactionStatus;
  createdAt: string;
  monnifyReference?: string;
  wallet?: {
    userId?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type TransactionPage = {
  items: TransactionRecord[];
  meta: PaginationMeta;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && "data" in value) {
    return value.data;
  }

  return value;
}

function normalizeMeta(value: unknown, page: number, limit: number, itemCount: number): PaginationMeta {
  if (!isRecord(value)) {
    return {
      total: itemCount,
      page,
      limit,
      totalPages: itemCount < limit ? page : page + 1,
    };
  }

  const total = Number(value.total ?? itemCount);
  const normalizedLimit = Number(value.limit ?? limit);
  const normalizedPage = Number(value.page ?? page);

  return {
    total,
    page: normalizedPage,
    limit: normalizedLimit,
    totalPages: Number(value.totalPages ?? Math.ceil(total / normalizedLimit)),
  };
}

function normalizeTransactionPage(result: unknown, page: number, limit: number): TransactionPage {
  const payload = unwrapData(result);

  if (Array.isArray(payload)) {
    return {
      items: payload as TransactionRecord[],
      meta: normalizeMeta(undefined, page, limit, payload.length),
    };
  }

  if (isRecord(payload)) {
    const candidateItems = payload.items ?? payload.transactions ?? payload.data;
    const items = Array.isArray(candidateItems) ? candidateItems as TransactionRecord[] : [];

    return {
      items,
      meta: normalizeMeta(payload.meta, page, limit, items.length),
    };
  }

  return {
    items: [],
    meta: normalizeMeta(undefined, page, limit, 0),
  };
}

function normalizeTransaction(result: unknown): TransactionRecord | null {
  const payload = unwrapData(result);

  if (isRecord(payload) && isRecord(payload.transaction)) {
    return payload.transaction as unknown as TransactionRecord;
  }

  return isRecord(payload) ? payload as unknown as TransactionRecord : null;
}

function getErrorMessage(result: unknown, fallback: string) {
  if (isRecord(result) && typeof result.message === "string") {
    return result.message;
  }

  return fallback;
}

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export async function getMyTransactionsAction(
  status?: TransactionStatus,
  page = 1,
  limit = 10,
) {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false as const,
      error: "Unauthorized",
      transactions: [] as TransactionRecord[],
      meta: normalizeMeta(undefined, page, limit, 0),
    };
  }

  try {
    const url = new URL(`${BACKEND_URL}/transactions`);
    if (status) url.searchParams.set("status", status);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        error: getErrorMessage(result, "Failed to fetch transactions"),
        transactions: [] as TransactionRecord[],
        meta: normalizeMeta(undefined, page, limit, 0),
      };
    }

    const normalized = normalizeTransactionPage(result, page, limit);
    return {
      success: true as const,
      transactions: normalized.items,
      meta: normalized.meta,
    };
  } catch (error) {
    console.error("Get transactions error:", error);
    return {
      success: false as const,
      error: "Connection error",
      transactions: [] as TransactionRecord[],
      meta: normalizeMeta(undefined, page, limit, 0),
    };
  }
}

export async function getMyTransactionAction(id: string) {
  const token = await getSessionToken();
  if (!token) return { success: false as const, error: "Unauthorized", transaction: null };

  try {
    const response = await fetch(`${BACKEND_URL}/transactions/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        error: getErrorMessage(result, "Failed to fetch transaction details"),
        transaction: null,
      };
    }

    return { success: true as const, transaction: normalizeTransaction(result) };
  } catch (error) {
    console.error("Get transaction details error:", error);
    return { success: false as const, error: "Connection error", transaction: null };
  }
}

export async function getAllTransactionsAdminAction(
  status?: TransactionStatus,
  userId?: string,
  page = 1,
  limit = 10,
) {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false as const,
      error: "Unauthorized",
      transactions: [] as TransactionRecord[],
      meta: normalizeMeta(undefined, page, limit, 0),
    };
  }

  try {
    const url = new URL(`${BACKEND_URL}/transactions/admin/all`);
    if (status) url.searchParams.set("status", status);
    if (userId) url.searchParams.set("userId", userId);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        error: getErrorMessage(result, "Failed to fetch admin transactions"),
        transactions: [] as TransactionRecord[],
        meta: normalizeMeta(undefined, page, limit, 0),
      };
    }

    const normalized = normalizeTransactionPage(result, page, limit);
    return {
      success: true as const,
      transactions: normalized.items,
      meta: normalized.meta,
    };
  } catch (error) {
    console.error("Get admin transactions error:", error);
    return {
      success: false as const,
      error: "Connection error",
      transactions: [] as TransactionRecord[],
      meta: normalizeMeta(undefined, page, limit, 0),
    };
  }
}

export async function getTransactionAdminAction(id: string) {
  const token = await getSessionToken();
  if (!token) return { success: false as const, error: "Unauthorized", transaction: null };

  try {
    const response = await fetch(`${BACKEND_URL}/transactions/admin/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        error: getErrorMessage(result, "Failed to fetch transaction details"),
        transaction: null,
      };
    }

    return { success: true as const, transaction: normalizeTransaction(result) };
  } catch (error) {
    console.error("Get admin transaction details error:", error);
    return { success: false as const, error: "Connection error", transaction: null };
  }
}
