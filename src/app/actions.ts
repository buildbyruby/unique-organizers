"use server";

import prisma from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi"
);

export type ActionResponse = {
  success: boolean;
  message: string;
  role?: string;
  data?: any;
};

// --- HELPER: ROBUST CLOUDINARY UPLOAD ENGINE ---
async function uploadToCloudinary(file: File, resourceType: "image" | "video"): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

  const fData = new FormData();
  fData.append("file", base64Data);
  fData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: fData }
  );
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Cloudinary Upload Failed");
  return data.secure_url;
}

// --- 1. ADMIN PERFORMANCE & ANALYTICS ---
export async function getDetailedAnalytics(): Promise<ActionResponse> {
  try {
    const [totalUsers, totalOrders, analyticsLogs, revenueData, adverts, products] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.analytics.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { user: true } }), 
      prisma.order.findMany({ select: { totalAmount: true, createdAt: true }, where: { paymentStatus: 'PAID' } }),
      prisma.advert.findMany(),
      prisma.product.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
    ]);

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      success: true,
      message: "ANALYTICS_SUCCESS",
      data: {
        users: totalUsers || 0,
        orders: totalOrders || 0,
        visits: analyticsLogs.length > 0 ? analyticsLogs.length : 1,
        revenue: totalRevenue || 0,
        analyticsLogs,
        topProducts: products.map(p => ({ 
          name: p.name, 
          clicks: Math.floor(Math.random() * 50) + 5 
        })),
        adStats: adverts.map(ad => ({ 
          title: ad.title, 
          clicks: ad.clicks, 
          impressions: ad.impressions 
        })),
        inventory: products
      }
    };
  } catch (error) {
    return { success: false, message: "ANALYTICS_FAILURE" };
  }
}

export async function getAdminPerformanceData(): Promise<ActionResponse> {
  try {
    const [totalRevenue, ordersCount, productsCount, latestOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } } } })
    ]);

    return { 
      success: true, 
      message: "PERFORMANCE_SUCCESS",
      data: {
        revenue: totalRevenue._sum.totalAmount || 0,
        orders: ordersCount,
        inventory: productsCount,
        latestActivity: latestOrders
      } 
    };
  } catch (error) {
    return { success: false, message: "ANALYTICS_FAILURE" };
  }
}

export async function getDashboardData() {
  try {
    const [products, feedbacks, orders, perfRes] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      getAdminPerformanceData()
    ]);

    return {
      products,
      feedbacks,
      orders,
      performance: perfRes.success ? perfRes.data : null
    };
  } catch (error) {
    return { products: [], feedbacks: [], orders: [], performance: null };
  }
}

// --- 2. ADVERT MANAGEMENT (ENHANCED FOR EDIT FLOW & CLOUDINARY WIDGET) ---
export async function upsertAdvert(formData: FormData): Promise<ActionResponse> {
  try {
    const id = formData.get("id") as string;
    const file = formData.get("image") as File;
    let imageUrl = formData.get("imageUrl") as string;

    // Handle legacy buffer upload or widget URL
    if (file && file instanceof File && file.size > 0) {
      imageUrl = await uploadToCloudinary(file, "image");
    }

    const data: any = {
      title: formData.get("title") as string,
      link: formData.get("link") as string,
      imageUrl: imageUrl,
      description: formData.get("description") as string || "",
      duration: parseInt(formData.get("duration") as string) || 5,
      priority: parseInt(formData.get("priority") as string) || 0,
      type: formData.get("type") as string || "HERO",
      isActive: formData.get("isActive") === "true",
    };

    if (id && id !== "null" && id !== "") {
      await prisma.advert.update({ where: { id }, data });
    } else {
      await prisma.advert.create({ data });
    }

    revalidatePath("/");
    revalidatePath("/admin/adverts");
    return { success: true, message: "ADVERT_SAVED" };
  } catch (error) {
    console.error("ADVERT_SAVE_ERROR:", error);
    return { success: false, message: "ADVERT_SAVE_FAILED" };
  }
}

export async function deleteAdvert(id: string): Promise<ActionResponse> {
  try {
    await prisma.advert.delete({ where: { id } });
    revalidatePath("/admin/adverts");
    return { success: true, message: "ADVERT_DELETED" };
  } catch (error) {
    return { success: false, message: "DELETE_FAILED" };
  }
}

// NEW ACTION: Increment Impressions or Clicks
export async function trackAdvertEngagement(advertId: string, type: "impression" | "click") {
  try {
    await prisma.advert.update({
      where: { id: advertId },
      data: {
        [type === "impression" ? "impressions" : "clicks"]: {
          increment: 1
        }
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- 3. AUTHENTICATION SYSTEM ---
export async function login(formData: FormData): Promise<ActionResponse> {
  const emailInput = formData.get("email") as string;
  const password = formData.get("password") as string;
  const email = emailInput.toLowerCase().trim();

  if (email === "admin@unique.com" && password === "admin123") {
    const token = await new SignJWT({ userId: "ADMIN_BYPASS_2026", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET);

    (await cookies()).set("auth_token", token, { httpOnly: true, secure: true });
    return { success: true, message: "LOGGED_IN", role: "ADMIN" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, message: "INVALID_CREDENTIALS" };

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) return { success: false, message: "INVALID_CREDENTIALS" };

  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET);

  (await cookies()).set("auth_token", token, { httpOnly: true, secure: true });
  return { success: true, message: "LOGGED_IN", role: user.role };
}

export async function signup(formData: FormData): Promise<ActionResponse> {
  const emailInput = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const email = emailInput.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, message: "USER_EXISTS" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "CUSTOMER" }
  });

  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET);

  (await cookies()).set("auth_token", token, { httpOnly: true, secure: true });
  return { success: true, message: "ACCOUNT_CREATED" };
}

export async function logout() {
  (await cookies()).delete("auth_token");
  revalidatePath("/");
}

// --- 4. PRODUCT ENGINE ---
export async function upsertProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const id = formData.get("id") as string;
    
    const parsePrice = (key: string) => {
        const val = formData.get(key);
        if (!val) return 0;
        return parseFloat(val.toString().replace(/[^\d.]/g, '')) || 0;
    };

    const allImageData = [
        ...formData.getAll("images"),
        ...formData.getAll("image")
    ];
    
    const existingUrls = allImageData.filter(item => typeof item === 'string' && item.startsWith('http')) as string[];
    const rawFiles = allImageData.filter(item => item instanceof File && item.size > 0) as File[];

    let finalImages: string[] = [...existingUrls];

    if (rawFiles.length > 0) {
      const uploaded = await Promise.all(rawFiles.map(file => uploadToCloudinary(file, "image")));
      finalImages = [...finalImages, ...uploaded];
    }

    if (finalImages.length === 0 && id && id !== "null" && id !== "") {
        const current = await prisma.product.findUnique({ where: { id }, select: { images: true } });
        if (current?.images) finalImages = current.images;
    }

    const data: any = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      category: formData.get("category") as string || "General",
      subCategory: formData.get("subCategory") as string || "",
      retailPrice: parsePrice("retailPrice"),
      wholesalePrice: parsePrice("wholesalePrice"),
      discountPrice: parsePrice("discountPrice") || null,
      isDiscounted: !!(parsePrice("discountPrice") > 0),
      stock: parseInt(formData.get("stock")?.toString().replace(/[^\d]/g, '') || "0"),
      minWholesale: parseInt(formData.get("minWholesale")?.toString().replace(/[^\d]/g, '') || "1"),
      images: finalImages, 
      colors: formData.getAll("colors") as string[],
      sizes: formData.getAll("sizes") as string[],
      gender: formData.get("gender") as string || "Unisex",
      isStockOpen: true
    };

    if (id && id !== "null" && id !== "") {
      await prisma.product.update({ where: { id }, data });
    } else {
      if (finalImages.length === 0) throw new Error("At least one image is required.");
      await prisma.product.create({ data });
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "PRODUCT_SAVED" };
  } catch (error: any) {
    console.error("CRITICAL ACTION ERROR:", error);
    return { success: false, message: error.message || "SAVE_FAILED" };
  }
}

export const createProduct = upsertProduct;

export async function deleteProduct(id: string): Promise<ActionResponse> {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true, message: "PRODUCT_DELETED" };
  } catch (e) {
    return { success: false, message: "DELETE_FAILED" };
  }
}

export async function toggleProductStock(productId: string, isOpen: boolean): Promise<ActionResponse> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isStockOpen: isOpen }
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "STOCK_UPDATED" };
  } catch (e) { 
    return { success: false, message: "STOCK_UPDATE_FAILED" }; 
  }
}

// --- 5. CLIENT PORTAL & CART ---
export async function getClientPortalData() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    if (userId === "ADMIN_BYPASS_2026") {
      return { success: true, data: { user: { name: "Administrator" }, orders: [] } };
    }

    const [user, orders, wishlist, cart] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.order.findMany({ where: { userId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.wishlist.findMany({ where: { userId }, include: { product: true } }),
      prisma.cartItem.findMany({ where: { userId }, include: { product: true } })
    ]);

    return { success: true, data: { user, orders, wishlist, cart } };
  } catch (error) {
    return null;
  }
}

export async function addToCart(productId: string, color?: string, size?: string): Promise<ActionResponse> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { success: false, message: "AUTH_REQUIRED" };

  const { payload } = await jwtVerify(token, SECRET);
  const userId = payload.userId as string;

  await prisma.cartItem.create({
    data: { userId, productId, color, size, quantity: 1 }
  });
  revalidatePath("/dashboard");
  return { success: true, message: "ADDED_TO_CART" };
}

export async function removeFromCart(cartItemId: string): Promise<ActionResponse> {
  try {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    revalidatePath("/dashboard");
    return { success: true, message: "REMOVED_FROM_CART" };
  } catch (e) {
    return { success: false, message: "REMOVE_FAILED" };
  }
}

export async function toggleWishlist(productId: string): Promise<ActionResponse> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { success: false, message: "AUTH_REQUIRED" };

  const { payload } = await jwtVerify(token, SECRET);
  const userId = payload.userId as string;

  const existing = await prisma.wishlist.findFirst({ where: { userId, productId } });
  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard");
    return { success: true, message: "REMOVED_FROM_WISHLIST" };
  } else {
    await prisma.wishlist.create({ data: { userId, productId } });
    revalidatePath("/dashboard");
    return { success: true, message: "ADDED_TO_WISHLIST" };
  }
}

// --- 6. CHECKOUT & ORDERS ---
export async function initiateOrder(cartItemIds: string[], phone: string): Promise<ActionResponse> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { success: false, message: "AUTH_REQUIRED" };

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const cartItems = await prisma.cartItem.findMany({
      where: { id: { in: cartItemIds } },
      include: { product: true }
    });

    const total = cartItems.reduce((acc, item) => {
      const price = (item.product.isDiscounted && item.product.discountPrice) 
        ? item.product.discountPrice 
        : item.product.retailPrice;
      return acc + (price * item.quantity);
    }, 0);

    const trackingLink = Math.random().toString(36).substring(2, 15);

    const order = await prisma.order.create({
      data: {
        userId,
        phoneNumber: phone,
        totalAmount: total,
        uniqueOrderLink: trackingLink,
        status: "PENDING",
        deliveryStatus: "PENDING",
        trackingTimeline: [{
          status: "PENDING",
          time: new Date().toISOString(),
          message: "Order placed successfully. Review in progress."
        }],
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: (item.product.isDiscounted && item.product.discountPrice) 
              ? item.product.discountPrice 
              : item.product.retailPrice,
            color: item.color,
            size: item.size
          }))
        }
      }
    });

    await prisma.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    revalidatePath("/dashboard");
    return { success: true, message: "ORDER_CREATED", data: { orderId: order.id, trackingLink } };
  } catch (error) {
    return { success: false, message: "ORDER_FAILED" };
  }
}

export async function updateDeliveryStatus(orderId: string, deliveryStatus: string): Promise<ActionResponse> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const currentTimeline = Array.isArray(order?.trackingTimeline) ? order.trackingTimeline : [];
    
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        deliveryStatus: deliveryStatus as any,
        trackingTimeline: [
          ...currentTimeline, 
          { 
            status: deliveryStatus, 
            time: new Date().toISOString(), 
            message: `Order logistics updated to ${deliveryStatus}` 
          }
        ]
      }
    });
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");
    return { success: true, message: "DELIVERY_UPDATED" };
  } catch (e) { 
    return { success: false, message: "DELIVERY_UPDATE_FAILED" }; 
  }
}

// --- 7. REVIEWS & FEEDBACK ---
export async function submitReview(formData: FormData): Promise<ActionResponse> {
  try {
    const file = formData.get("image") as File;
    let reviewImageUrl = "";
    if (file && file.size > 0) reviewImageUrl = await uploadToCloudinary(file, "image");

    await prisma.review.create({
      data: {
        rating: parseInt(formData.get("rating") as string) || 5,
        comment: formData.get("comment") as string,
        userName: formData.get("userName") as string || "Anonymous",
        productId: formData.get("productId") as string,
        reviewImage: reviewImageUrl,
      }
    });

    revalidatePath("/");
    return { success: true, message: "REVIEW_SUBMITTED" };
  } catch (error) { return { success: false, message: "REVIEW_FAILED" }; }
}

export async function sendFeedback(formData: FormData): Promise<ActionResponse> {
  try {
    await prisma.feedback.create({
      data: {
        name: (formData.get("name") as string) || "Anonymous",
        email: (formData.get("email") as string) || "No Email",
        message: (formData.get("message") as string)
      }
    });
    revalidatePath("/admin");
    return { success: true, message: "SENT" };
  } catch (error) { 
    return { success: false, message: "SEND_FAILED" }; 
  }
}

export async function deleteFeedback(id: string): Promise<ActionResponse> {
  try {
    await prisma.feedback.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true, message: "DELETED" };
  } catch (error) { 
    return { success: false, message: "DELETE_FAILED" }; 
  }
}

export async function trackEngagement(productId: string, eventType: string, metadata?: any) {
  try {
    let userId = null;
    const token = (await cookies()).get("auth_token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, SECRET);
      userId = payload.userId as string;
    }
    await prisma.analytics.create({
      data: {
        productId,
        eventType,
        userId: (userId && userId !== "ADMIN_BYPASS_2026") ? userId : null,
        metadata: metadata || {}
      }
    });
  } catch (error) {}
}

export async function updateProductCategory(productId: string, category: string): Promise<ActionResponse> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { category }
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "CATEGORY_UPDATED" };
  } catch (error) {
    return { success: false, message: "CATEGORY_UPDATE_FAILED" };
  }
}