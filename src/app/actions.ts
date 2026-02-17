"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026-secure-key");

/**
 * SESSION SYSTEM
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
 * AUTH: Login (Bypasses Prisma entirely!)
 */
export async function login(formData: FormData) {
  try {
    const emailInput = formData.get("email") as string;
    const passwordInput = formData.get("password") as string;
    const ADMIN_EMAIL = "admin@unique.com";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD; 

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
 * AUTH: Register User (Prisma isolated here)
 */
export async function registerUser(formData: FormData) {
  const prisma = new PrismaClient(); // Only connects when someone actually registers
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, message: "EMAIL_EXISTS" };

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" }
    });

    return { success: true, message: "REGISTRATION_SUCCESS" };
  } catch (error) {
    return { success: false, message: "REGISTRATION_FAILED" };
  } finally {
    await prisma.$disconnect();
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
  const data = await response.json();
  return data.secure_url;
}

/**
 * ADMIN: Add Product (Prisma isolated here)
 */
export async function addProduct(formData: FormData) {
  const auth = await getAuth();
  if (auth?.role !== "ADMIN") return { success: false, message: "UNAUTHORIZED" };

  const prisma = new PrismaClient(); // Only connects when adding a product
  try {
    const imageFiles = formData.getAll("images") as File[];
    const validFiles = imageFiles.filter(f => f.size > 0);
    const imageUrls = await Promise.all(validFiles.map(uploadToCloudinary));

    await prisma.product.create({
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        retailPrice: parseFloat(formData.get("retailPrice") as string),
        wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
        stock: parseInt(formData.get("stock") as string) || 0,
        colors: formData.getAll("colors") as string[],
        images: imageUrls,
        inStock: true,
      }
    });

    revalidatePath("/");
    return { success: true, message: "PRODUCT_ADDED" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "DATABASE_ERROR" };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PAYMENT: M-Pesa STK Push
 */
export async function initiateSTKPush(phoneNumber: string, amount: number) {
  try {
    const { initiateStkPush } = await import('@/lib/mpesa')
    const reference = `ORD-${Math.random().toString(36).toUpperCase().slice(2, 10)}`
    const data = await initiateStkPush(phoneNumber, amount, reference)
    return { success: data.ResponseCode === "0", message: "STK Push initiated" }
  } catch (error) {
    return { success: false, message: "Failed to connect to M-Pesa" }
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  revalidatePath("/");
  return { success: true };
}