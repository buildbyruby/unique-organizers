import Link from 'next/link'
import { CheckCircle, ArrowRight, Package } from 'lucide-react'

export default async function SuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ ref: string }> 
}) {
  // Await the searchParams promise to get the actual values
  const { ref } = await searchParams;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
            <CheckCircle size={80} className="text-green-500 relative" />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Order Logged</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Reference: {ref}</p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Package size={18} className="text-purple-500" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase">Status</p>
                    <p className="text-sm font-bold uppercase">Preparing for Dispatch</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
                Our team is verifying your acquisition. You will receive an SMS via M-Pesa once the STK push is triggered.
            </p>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 hover:text-white transition">
            Continue Exploration <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}