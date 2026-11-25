import { prisma } from "@/lib/prisma"
import { CheckCircle2, Package, Truck, MapPin, ShieldCheck, Clock } from "lucide-react"
import Link from "next/link"

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  // FIXED: Await the params Promise for Next.js 16
  const resolvedParams = await params;
  
  const order = await prisma.order.findUnique({
    where: { uniqueOrderLink: resolvedParams.id },
    include: { items: { include: { product: true } } }
  })

  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-widest">Order Node Not Found</div>

  const steps = [
    { label: 'Order Received', status: 'PENDING', icon: <Clock /> },
    { label: 'Confirmed', status: 'CONFIRMED', icon: <Package /> },
    { label: 'In Transit', status: 'SHIPPED', icon: <Truck /> },
    { label: 'Delivered', status: 'DELIVERED', icon: <CheckCircle2 /> }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <ShieldCheck size={14} /> Secure Verification Portal
            </div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">Order Log: {order.uniqueOrderLink}</h1>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-right min-w-[200px]">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Valuation</p>
            <p className="text-3xl font-black italic text-white font-mono">KSh {order.totalAmount.toLocaleString()}</p>
          </div>
        </header>

        {/* TRACKING TIMELINE */}
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            // FIX: Use optional chaining (?.) and fallback to empty array (|| []) to prevent 'possibly null' error
            const isCompleted = (order.trackingTimeline as any[] || []).some((t: any) => t.status === step.status)
            
            return (
              <div key={step.label} className={`p-8 rounded-[2rem] border transition-all ${isCompleted ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                <div className="mb-4">{step.icon}</div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{step.label}</p>
                {isCompleted && <CheckCircle2 size={16} className="mt-2 text-green-600" />}
              </div>
            )
          })}
        </div>

        {/* ORDER DETAILS */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-8 flex items-center gap-2">
              <Package size={14} /> Manifest Items
            </h3>
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <p className="font-black text-lg italic uppercase">{item.product.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.color} | Qty: {item.quantity}</p>
                </div>
                <p className="font-mono text-sm">KSh {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
             <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12} /> Delivery Destination
                </p>
                <p className="text-xl font-bold italic">{order.phoneNumber}</p>
             </div>
             <div className="pt-8 border-t border-white/5 flex flex-wrap gap-3">
                <Link href={`/track/${order.uniqueOrderLink}`} className="inline-block px-8 py-5 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-500 transition-all">
                  Live Delivery Timeline
                </Link>
                <Link href="/" className="inline-block px-8 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                  Return to Mainframe
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}