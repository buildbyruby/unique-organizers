import Link from 'next/link'
import { registerUser } from './actions' // Import the logic we just made

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9FA] p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-white">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">
          Create <span className="text-pink-600">Account</span>
        </h1>

        <form action={registerUser} className="space-y-4">
          <input 
            name="name" 
            type="text" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none" 
            placeholder="Full Name" 
          />
          <input 
            name="email" 
            type="email" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none" 
            placeholder="Email Address" 
          />
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none" 
            placeholder="Password" 
          />

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-pink-600 transition-all">
            Register Now
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-600">
            Already have an account? <span className="underline underline-offset-4">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  )
}