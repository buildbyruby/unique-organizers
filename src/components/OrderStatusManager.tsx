"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions"; 
import { toast, Toaster } from "react-hot-toast";

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusManager({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: any) => {
    const oldStatus = status;
    setStatus(newStatus); // Optimistic UI update
    
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        toast.success(`Order ${newStatus.toLowerCase()}`);
      } else {
        toast.error("Failed to update status");
        setStatus(oldStatus); // Revert if failed
      }
    });
  };

  return (
    <>
      <Toaster position="top-right" />
      <select 
        value={status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`text-[10px] px-6 py-3 rounded-2xl font-black uppercase bg-slate-100 border-none w-full cursor-pointer transition-all ${
            isPending ? "opacity-50 grayscale" : "opacity-100"
        }`}
      >
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </>
  );
}