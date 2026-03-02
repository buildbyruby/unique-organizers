"use client"

import { useState } from 'react'
import { login, signup } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const result = isLogin ? await login(formData) : await signup(formData)

    if (result.success) {
      // Redirect based on role
      if (result.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(result.message.replace(/_/g, " "))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        
        {/* LOGO AREA */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-4 shadow-xl">
            <ShoppingBag className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">
            Unique_<span className="text-purple-600">Access</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {isLogin ? "Welcome back to the collective" : "Join the inner circle"}
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="client@unique.com"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase p-4 rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-purple-600 transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <> {isLogin ? 'Enter Portal' : 'Create Account'} <ArrowRight size={18} /> </>
              )}
            </button>
          </form>
        </div>

        {/* TOGGLE VIEW */}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
        </button>
      </div>
    </div>
  )
}