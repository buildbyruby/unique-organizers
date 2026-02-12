"use client"
import Link from 'next/link'
import { registerUser } from '../actions' // Corrected path
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await registerUser(formData);
    if (result.success) {
      router.push("/login");
    } else {
      setError(result.message === "EMAIL_EXISTS" ? "Email already registered" : "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9FA] p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-white">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">
          Create <span className="text-pink-600">Account</span>
        </h1>

        {error && <p className="text-red-500 text-xs font-bold mb-4 uppercase tracking-widest">{error}</p>}

        <form action={handleSubmit} className="space-y-4">
          <input 
            name="name" 
            type="text" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-pink-200 transition-all" 
            placeholder="Full Name" 
          />
          <input 
            name="email" 
            type="email" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-pink-200 transition-all" 
            placeholder="Email Address" 
          />
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-pink-200 transition-all" 
            placeholder="Password" 
          />

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-pink-600 transition-all shadow-lg">
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