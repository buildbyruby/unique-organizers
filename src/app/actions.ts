"use server";

import { adminDb } from "@/lib/firebase-admin"; 
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026-secure-key");

// This interface guarantees to the compiler that 'message' always exists
interface ActionResponse {
  success: boolean;
  message: string;
  role?: string;
}

/**
 * AUTH: Login
 */
export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const userRef = adminDb.collection("users");
    const querySnapshot = await userRef.where("email", "==", email).get();

    if (querySnapshot.empty) return { success: false, message: "INVALID_CREDENTIALS" };
    
    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (!(await bcrypt.compare(password, user.password))) {
      return { success: false, message: "INVALID_CREDENTIALS" };
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET);

    (await cookies()).set("auth_token", token, { 
      httpOnly: true, 
      secure: true, 
      path: "/",
      maxAge: 86400 
    });

    return { success: true, message: "SUCCESS", role: user.role };
  } catch (error) {
    return { success: false, message: "SYSTEM_ERROR" };
  }
}

/**
 * ADMIN: Add Product
 */
export async function addProduct(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Check if the user is an admin via cookies
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "ADMIN") return { success: false, message: "UNAUTHORIZED" };

    // 2. Add to Firestore using adminDb (Server-side)
    await adminDb.collection("products").add({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      retailPrice: parseFloat(formData.get("retailPrice") as string),
      wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      colors: formData.getAll("colors"),
      createdAt: new Date().toISOString()
    });

    revalidatePath("/");
    return { success: true, message: "PRODUCT_ADDED" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "FIREBASE_WRITE_ERROR" };
  }
}