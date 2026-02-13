"use server"

import { db } from "@/lib/firebase"; // You created this in Phase 1
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  addDoc 
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

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
 * CLOUDINARY UPLOAD (Remains the same)
 */
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

/**
 * AUTH: Register User (Firestore)
 */
export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Check if user exists in Firestore
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) return { success: false, message: "EMAIL_EXISTS" };

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const newUserRef = doc(collection(db, "users"));
    await setDoc(newUserRef, {
      id: newUserRef.id,
      name,
      email,
      password: hashedPassword,
      role: "USER",
      createdAt: new Date().toISOString()
    });

    return { success: true, message: "REGISTRATION_SUCCESS" };
  } catch (error) {
    console.error("Firebase Register Error:", error);
    return { success: false, message: "REGISTRATION_FAILED" };
  }
}

/**
 * AUTH: Login (Firestore)
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const userRef = collection(db, "users");
  const q = query(userRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

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

  return { success: true, role: user.role };
}

/**
 * ADMIN: Add Product (Firestore)
 */
export async function addProduct(formData: FormData) {
  const auth = await getAuth();
  if (auth?.role !== "ADMIN") return { success: false, message: "UNAUTHORIZED" };

  try {
    const imageFiles = formData.getAll("images") as File[];
    const validFiles = imageFiles.filter(f => f.size > 0);
    const imageUrls = await Promise.all(validFiles.map(uploadToCloudinary));

    await addDoc(collection(db, "products"), {
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
  } catch (error) {
    return { success: false, message: "FIREBASE_WRITE_ERROR" };
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
    
    return { 
      success: data.ResponseCode === "0", 
      message: data.CustomerMessage || data.errorMessage || "STK Push initiated" 
    }
  } catch (error) {
    console.error("M-Pesa STK Error:", error)
    return { success: false, message: "Failed to connect to M-Pesa" }
  }
}