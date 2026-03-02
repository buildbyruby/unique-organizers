"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Processes the checkout data, saves a 'PENDING' order to your database,
 * and returns a WhatsApp URL containing a link back to the product.
 */
export async function processCheckoutAndWhatsApp(formData: {
  productId: string;
  productName: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  phone: string;
  origin: string; // The base URL of your site (e.g., https://your-store.com)
}) {
  try {
    // 1. Generate a recognizable reference
    const orderRef = `ORD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    
    // 2. Build the exact URL for the product the customer is viewing
    const productUrl = `${formData.origin}/product/${formData.productId}`;

    // 3. Create entry in Database so it appears in Admin Order Logs
    const order = await prisma.order.create({
      data: {
        totalAmount: formData.price * formData.quantity,
        phoneNumber: formData.phone || "GUEST_VIA_WHATSAPP",
        accountReference: orderRef,
        status: 'PENDING',
        deliveryStatus: 'PENDING',
        paymentStatus: 'INITIATED',
        items: {
          create: {
            productId: formData.productId,
            quantity: formData.quantity,
            price: formData.price,
            color: formData.color,
            size: formData.size,
          }
        }
      }
    });

    // 4. Construct the WhatsApp Message
    const adminPhone = "254797517565"; 
    
    // Header informing of the link
    let message = `Hi! I'd like to purchase this item: ${productUrl}\n`;
    message += `----------------------------\n`;
    message += `🛍️ *Product:* ${formData.productName}\n`;
    message += `🎨 *Color:* ${formData.color || 'Standard'}\n`;
    
    if (formData.size && formData.size !== 'default') {
      message += `📏 *Size:* ${formData.size}\n`;
    }
    
    message += `🔢 *Qty:* ${formData.quantity}\n`;
    message += `💰 *Total:* KSh ${order.totalAmount.toLocaleString()}\n`;
    message += `----------------------------\n`;
    message += `🆔 *Order Ref:* ${orderRef}\n\n`;
    message += `Please let me know how to proceed with payment! ✨`;

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    // 5. Trigger Real-time update for your Admin Dashboard
    revalidatePath("/admin/orders");
    revalidatePath("/admin/delivery");

    return { 
      success: true, 
      url: whatsappUrl 
    };
  } catch (error) {
    console.error("WHATSAPP_ACTION_ERROR:", error);
    return { 
      success: false, 
      message: "Checkout synchronization failed." 
    };
  }
}