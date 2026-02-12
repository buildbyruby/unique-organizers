"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

/**
 * UTILITY: Cloudinary Server-Side Upload
 * Handles direct file buffer uploads from the server to Cloudinary
 */
async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to cloud storage.");
  }
}

/**
 * ADMIN ACTION: Add Product
 * Handles multi-image uploads, color arrays, and database insertion
 */
export async function addProduct(formData: FormData) {
  // 1. Security Guard
  const isAuthorized = await isAdmin();
  if (!isAuthorized) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  try {
    // 2. Extract Data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const retailPrice = parseFloat(formData.get("retailPrice") as string);
    const wholesalePrice = parseFloat(formData.get("wholesalePrice") as string) || 0;
    const inStock = formData.get("inStock") === "true";
    
    // Extract multi-select or multi-input colors
    const colors = formData.getAll("colors") as string[]; 
    
    // 3. Handle Images
    const imageFiles = formData.getAll("images") as File[];
    // Filter out empty file inputs
    const validFiles = imageFiles.filter((file) => file.name !== "undefined" && file.size > 0);
    
    if (validFiles.length === 0) {
      return { success: false, message: "At least one product image is required." };
    }

    // Upload all images in parallel
    const imageUrls = await Promise.all(validFiles.map(uploadToCloudinary));

    // 4. Database Insertion
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        retailPrice,
        wholesalePrice,
        images: imageUrls,
        colors: colors,
        inStock,
      },
    });

    // 5. Refresh Data
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/product/" + product.id);

    return { success: true, message: "Product created successfully", productId: product.id };
  } catch (error) {
    console.error("Add Product Error:", error);
    return { success: false, message: "Failed to create product. Check logs." };
  }
}

/**
 * ADMIN ACTION: Delete Product
 */
export async function deleteProduct(productId: string) {
  const isAuthorized = await isAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Could not delete product." };
  }
}

/**
 * PAYMENT ACTION: M-Pesa STK Push
 * (Your existing logic, fully integrated)
 */
export async function initiateSTKPush(phoneNumber: string, amount: number) {
  const consumerKey = "ZzSpGBy4ZAiklaxhkNrtGpFw4wSGN9kczgmtXWlQ2vs03MSl";
  const consumerSecret = "2d8UWwgQ8XUVueHxJVXfxSFTfEcg4tD4KvmEtszZDVsugD3BQXnXrg8lTrKwh31e";
  const shortCode = "174379";
  const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const callbackUrl = "https://gametophoric-an-mystically.ngrok-free.dev/api/mpesa/callback";

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) throw new Error("Failed to generate M-Pesa access token");

    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("254")
      ? cleanPhone
      : "254" + cleanPhone.slice(-9);

    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount, // Dynamic amount
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: "UNIQUE-ORG-" + Math.floor(Math.random() * 10000),
          TransactionDesc: "Unique Organizers Order",
        }),
      }
    );

    const data = await stkResponse.json();
    console.log("M-Pesa Sandbox Response:", data);

    return { success: true, data };
  } catch (error) {
    console.error("Critical M-Pesa Error:", error);
    return { success: false, message: "Internal Server Error during payment initiation." };
  }
}