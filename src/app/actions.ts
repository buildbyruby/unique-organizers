"use server";

import { adminDb } from "@/lib/firebase-admin"; 
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026-secure-key");

interface ActionResponse {
  success: boolean;
  message: string;
  role?: string;
  data?: any;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
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

export async function registerUser(formData: FormData): Promise<ActionResponse> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userRef = adminDb.collection("users");
    const querySnapshot = await userRef.where("email", "==", email).get();
    if (!querySnapshot.empty) return { success: false, message: "EMAIL_EXISTS" };
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserDoc = userRef.doc();
    await newUserDoc.set({ id: newUserDoc.id, name, email, password: hashedPassword, role: "USER", createdAt: new Date().toISOString() });
    return { success: true, message: "REGISTRATION_SUCCESS" };
  } catch (error) { return { success: false, message: "REGISTRATION_FAILED" }; }
}

export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userRef = adminDb.collection("users");
    const querySnapshot = await userRef.where("email", "==", email).get();
    if (querySnapshot.empty) return { success: false, message: "INVALID_CREDENTIALS" };
    const user = querySnapshot.docs[0].data();
    if (!(await bcrypt.compare(password, user.password))) return { success: false, message: "INVALID_CREDENTIALS" };
    const token = await new SignJWT({ userId: user.id, role: user.role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").sign(SECRET);
    (await cookies()).set("auth_token", token, { httpOnly: true, secure: true, path: "/", maxAge: 86400 });
    return { success: true, message: "SUCCESS", role: user.role };
  } catch (error) { return { success: false, message: "SYSTEM_ERROR" }; }
}

export async function addProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "ADMIN") return { success: false, message: "UNAUTHORIZED" };
    const imageFiles = formData.getAll("images") as File[];
    const validFiles = imageFiles.filter(f => f.size > 0);
    const imageUrls = await Promise.all(validFiles.map(uploadToCloudinary));
    await adminDb.collection("products").add({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      retailPrice: parseFloat(formData.get("retailPrice") as string),
      wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      colors: formData.getAll("colors"),
      images: imageUrls,
      inStock: true,
      createdAt: new Date().toISOString()
    });
    revalidatePath("/");
    return { success: true, message: "PRODUCT_ADDED" };
  } catch (error) { return { success: false, message: "FIREBASE_WRITE_ERROR" }; }
}

// FIXED: Accept arguments to match PaymentForm.tsx calls
export async function initiateSTKPush(phone?: string, amount?: number): Promise<ActionResponse> {
  return { 
    success: false, 
    message: "Payment system moving to WhatsApp. Please contact +254 797 517 565",
    data: { ResponseCode: "1" } 
  };
}