"use client"

import { updateOrderStatus } from './actions'

export default function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  return (
    <select 
      defaultValue={currentStatus}
      onChange={async (e) => {
        await updateOrderStatus(orderId, e.target.value as any)
        // Optionally refresh page to show new status icon
        window.location.reload()
      }}
      className="bg-black border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-purple-500 transition-colors cursor-pointer"
    >
      <option value="PENDING">Pending</option>
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  )
}