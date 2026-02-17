"use server";

import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi");

interface ActionResponse {
  success: boolean;
  message: string;
  role?: string;
  data?: any;
}

// --- LOGIN (With Manual Admin Override) ---
export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // YOUR MANUAL CREDENTIALS
    const ADMIN_EMAIL = "admin@unique.com";
    const ADMIN_PASS = "unique2026_secure";

    let user;

    // Check if it's the "Hardcoded" Admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      // Find or Create this admin in Supabase automatically
      const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
      user = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { role: "ADMIN" },
        create: {
          email: ADMIN_EMAIL,
          name: "Admin",
          password: hashedPassword,
          role: "ADMIN"
        }
      });
    } else {
      // Normal login for everyone else
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return { success: false, message: "INVALID_CREDENTIALS" };
      }
    }

    // Sign the token
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
    console.error("Login Error:", error);
    return { success: false, message: "SYSTEM_ERROR" };
  }
}

// --- ADD PRODUCT ---
export async function addProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return { success: false, message: "UNAUTHORIZED" };
    
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "ADMIN") return { success: false, message: "UNAUTHORIZED" };

    const imageFiles = formData.getAll("images") as File[];
    const validFiles = imageFiles.filter(f => f.size > 0);
    
    // Cloudinary Logic
    const imageUrls = await Promise.all(validFiles.map(async (file) => {
      const fData = new FormData();
      fData.append("file", file);
      fData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fData,
      });
      const data = await res.json();
      return data.secure_url;
    }));

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
      }
    });

    revalidatePath("/");
    return { success: true, message: "PRODUCT_ADDED" };
  } catch (error) {
    return { success: false, message: "DATABASE_ERROR" };
  }
}

// WhatsApp STUB
export async function initiateSTKPush(phone?: string, amount?: number): Promise<ActionResponse> {
  return { success: false, message: "WhatsApp Active", data: { ResponseCode: "1" } };
}

// Register (Normal Users)
export async function registerUser(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = await bcrypt.hash(formData.get("password") as string, 10);
    await prisma.user.create({ data: { email, password, name: formData.get("name") as string, role: "USER" } });
    return { success: true, message: "REGISTRATION_SUCCESS" };
  } catch (e) { return { success: false, message: "FAILED" }; }
}