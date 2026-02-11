import Link from 'next/link'

export default async function SuccessPage(props: {
  searchParams: Promise<{ ref?: string }>
}) {
  const searchParams = await props.searchParams;
  const reference = searchParams.ref || "ORDER";

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl shadow-pink-100/50 p-12 text-center border border-pink-50 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-500 to-slate-900" />

        <div className="mx-auto h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-8">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
          Order <span className="text-pink-500">Reserved</span>
        </h1>
        
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">
          Complete payment to finalize
        </p>

        <div className="bg-slate-900 text-white rounded-[2rem] p-8 mb-8 text-left space-y-4 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 border-b border-slate-800 pb-2">Payment Instructions</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Paybill</span>
            <span className="text-xl font-black italic">522522</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Account Number</span>
            <span className="text-xl font-black italic text-pink-500 underline">{reference}</span>
          </div>
        </div>

        <Link 
          href="/dashboard" 
          className="block w-full bg-slate-100 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all mb-4"
        >
          View My Orders
        </Link>

        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
          Once you pay via M-Pesa, your order status will be updated automatically within 24 hours.
        </p>
      </div>
    </div>
  )
}