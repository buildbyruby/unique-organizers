"use server";

import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi");

// Standardized response to prevent TypeScript errors in forms
export type ActionResponse = {
  success: boolean;
  message: string;
  role?: string;
  data?: any;
};

// --- PAYMENT & WHATSAPP REDIRECT ---
// This function is required by PaymentForm.tsx
export async function initiateSTKPush(phone?: string, amount?: number): Promise<ActionResponse> {
  // Since you are handling actual communication via window.open on the client, 
  // this server action acts as a successful bridge.
  return { 
    success: true, 
    message: "WHATSAPP_REDIRECT_READY", 
    data: { status: "OK" } 
  };
}

// --- PRODUCT MANAGEMENT ---
export async function updateProductCategory(productId: string, newCategory: string): Promise<ActionResponse> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { category: newCategory }
    });
    revalidatePath("/");
    return { success: true, message: "CATEGORY_UPDATED" };
  } catch (error) {
    return { success: false, message: "UPDATE_FAILED" };
  }
}

export async function addProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    
    const imageFiles = formData.getAll("images") as File[];
    const validFiles = imageFiles.filter(f => f.size > 0);
    
    const imageUrls = await Promise.all(validFiles.map(async (file) => {
      const fData = new FormData();
      fData.append("file", file);
      fData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fData,
      });
      if (!res.ok) {
        throw new Error("CLOUDINARY_UPLOAD_FAILED");
      }
      const data = await res.json();
      return data.secure_url || data.url || "";
    }));

    const sanitizedImageUrls = imageUrls.filter((url): url is string => typeof url === "string" && url.length > 0);

    await prisma.product.create({
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        retailPrice: parseFloat(formData.get("retailPrice") as string),
        wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
        stock: parseInt(formData.get("stock") as string) || 0,
        colors: formData.getAll("colors") as string[],
        images: sanitizedImageUrls,
      }
    });

    revalidatePath("/");
    return { success: true, message: "PRODUCT_ADDED" };
  } catch (error) { return { success: false, message: "DATABASE_ERROR" }; }
}

// --- PUBLIC REVIEWS & RATINGS ---
export async function submitReview(formData: FormData): Promise<void> {
  try {
    const rating = parseInt(formData.get("rating") as string) || 5;
    const comment = formData.get("comment") as string;
    const userName = formData.get("userName") as string;

    await prisma.review.create({
      data: {
        rating,
        comment,
        userName: userName || "Valued Client",
      }
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Review Error:", error);
  }
}

export async function deleteReview(id: string): Promise<ActionResponse> {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    
    await prisma.review.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "REVIEW_DELETED" };
  } catch (error) {
    return { success: false, message: "DELETE_FAILED" };
  }
}

// --- AUTHENTICATION & REGISTRATION ---
export async function registerUser(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, message: "EMAIL_EXISTS" };

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name: name || "New Node",
        password: hashedPassword,
        role: "CUSTOMER"
      }
    });

    return { success: true, message: "REGISTRATION_SUCCESS" };
  } catch (error) { 
    return { success: false, message: "FAILED" }; 
  }
}

export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const ADMIN_EMAIL = "admin@unique.com";
    const ADMIN_PASS = "unique2026_secure";

    let user;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
      user = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { role: "ADMIN" },
        create: { email: ADMIN_EMAIL, name: "Admin", password: hashedPassword, role: "ADMIN" }
      });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return { success: false, message: "INVALID_CREDENTIALS" };
      }
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET);

    (await cookies()).set("auth_token", token, { httpOnly: true, secure: true, path: "/", maxAge: 86400 });
    return { success: true, message: "SUCCESS", role: user.role };
  } catch (error) { return { success: false, message: "SYSTEM_ERROR" }; }
}

// --- FEEDBACK ---
export async function sendFeedback(formData: FormData): Promise<ActionResponse> {
  try {
    const message = formData.get("message") as string;
    if (!message) return { success: false, message: "REQUIRED" };
    await prisma.feedback.create({
      data: {
        name: (formData.get("name") as string) || "Anonymous",
        email: (formData.get("email") as string) || "No Email",
        message: message
      }
    });
    return { success: true, message: "SENT" };
  } catch (error) { return { success: false, message: "ERROR" }; }
}

export async function deleteFeedback(id: string): Promise<ActionResponse> {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    await prisma.feedback.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true, message: "DELETED" };
  } catch (error) { return { success: false, message: "ERROR" }; }
}
