"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001/api/v1";

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Invalid credentials." };
    }

    const body = result.data || result;

    // Detect if user is an unverified admin and an OTP resend was triggered
    if (body.message === "OTP resent successfully." || (!body.token && body.email)) {
      return { success: true, needsOtpVerification: true, email: body.email };
    }

    const { token, role, firstName, lastName } = body;

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set("session_role", role.toLowerCase(), {
      httpOnly: false, // Accessible by client components if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, role: role.toLowerCase(), name: `${firstName} ${lastName}` };
  } catch (error: any) {
    console.error("Sign in action error:", error);
    return { success: false, error: "Failed to connect to authentication server." };
  }
}

export async function resendOtpAction(email: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/organization/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to resend OTP." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resend OTP action error:", error);
    return { success: false, error: "Failed to connect to authentication server." };
  }
}


export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const industry = formData.get("industry")?.toString().trim();
  const size = formData.get("size")?.toString().trim();
  const adminEmail = formData.get("adminEmail")?.toString().trim();
  const adminFirstName = formData.get("adminFirstName")?.toString().trim();
  const adminLastName = formData.get("adminLastName")?.toString().trim();
  const adminPassword = formData.get("adminPassword")?.toString();

  if (!name || !industry || !adminEmail || !adminFirstName || !adminLastName || !adminPassword) {
    return { success: false, error: "All fields except size are required." };
  }

  if (adminPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/organization/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        industry,
        size: size || undefined,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Failed to register organization." };
    }

    return { success: true, email: adminEmail, needsOtpVerification: true };
  } catch (error: any) {
    console.error("Sign up action error:", error);
    return { success: false, error: "Failed to connect to authentication server." };
  }
}

export async function verifyOtpAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const code = formData.get("code")?.toString().trim();

  if (!email || !code) {
    return { success: false, error: "Email and OTP code are required." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/organization/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Invalid OTP code." };
    }

    const { token, admin, orgWallet } = result.data || result;
    const role = admin.userRole.toLowerCase();

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("session_role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, role, name: `${admin.firstName} ${admin.lastName}`, orgWallet };
  } catch (error: any) {
    console.error("Verify OTP action error:", error);
    return { success: false, error: "Failed to connect to authentication server." };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const token = formData.get("token")?.toString().trim();

  if (!firstName || !lastName || !email || !password || !token) {
    return { success: false, error: "All fields are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        token,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Registration failed." };
    }

    const { token: sessionToken, userRole } = result.data || result;
    const role = userRole.toLowerCase();

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("session_role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, role, name: `${firstName} ${lastName}` };
  } catch (error: any) {
    console.error("Register action error:", error);
    return { success: false, error: "Failed to connect to authentication server." };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  cookieStore.delete("session_role");
  redirect("/signin");
}

export async function getMeAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/onboarding/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return null;
    }

    return result.data || result;
  } catch (error) {
    console.error("GetMe action error:", error);
    return null;
  }
}

export async function getWalletAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return null;
    }

    return result.data || result;
  } catch (error) {
    console.error("GetWallet action error:", error);
    return null;
  }
}

export async function getOrgWalletAction(orgId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token || !orgId) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/wallet/org/${orgId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return null;
    }

    return result.data || result;
  } catch (error) {
    console.error("GetOrgWallet action error:", error);
    return null;
  }
}
