"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// This pulls the secret from your .env to keep your session safe
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026-secure-key");

/**
 * SESSION CHECK
 */
async function getAuth() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

/**
 * LOGIN: FIXED FOR admin@unique.com
 */
export async function login(formData: FormData) {
  try {
    const emailInput = formData.get("email") as string;
    const passwordInput = formData.get("password") as string;

    // These match exactly what you told me and what is in your .env
    const ADMIN_EMAIL = "admin@unique.com";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD; // This is unique2026_secure in your .env

    if (emailInput === ADMIN_EMAIL && passwordInput === ADMIN_PASS) {
      const token = await new SignJWT({ userId: "admin-id", role: "ADMIN" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(SECRET);

      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        path: "/",
        maxAge: 86400 
      });

      return { success: true, role: "ADMIN" };
    }

    return { success: false, message: "INVALID_CREDENTIALS" };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "SYSTEM_ERROR" };
  }
}

/**
 * CLOUDINARY UPLOAD
 */
async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset!);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Cloudinary upload failed");
  const data = await response.json();
  return data.secure_url;
}

/**
 * M-PESA STK PUSH
 */
export async function initiateSTKPush(phoneNumber: string, amount: number) {
  try {
    const { initiateStkPush } = await import('@/lib/mpesa')
    const reference = `ORD-${Math.random().toString(36).toUpperCase().slice(2, 10)}`
    const data = await initiateStkPush(phoneNumber, amount, reference)
    
    return { 
      success: data.ResponseCode === "0", 
      message: data.CustomerMessage || data.errorMessage || "STK Push initiated" 
    }
  } catch (error) {
    console.error("M-Pesa STK Error:", error)
    return { success: false, message: "Failed to connect to M-Pesa" }
  }
}

/**
 * LOGOUT
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  revalidatePath("/");
  return { success: true };
}