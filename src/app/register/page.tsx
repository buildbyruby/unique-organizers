"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { registerUser } from '../actions';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  Sparkles 
} from 'lucide-react';

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    
    startTransition(async () => {
      const result = await registerUser(formData);
      if (result.success) {
        router.push("/login");
      } else {
        setError(
          result.message === "EMAIL_EXISTS" 
            ? "NODE ALREADY REGISTERED IN DATABASE" 
            : "INITIALIZATION FAILED: CHECK PARAMETERS"
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 selection:bg-purple-500/30 font-sans antialiased relative overflow-hidden">
      
      {/* Background Kinetic Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0c] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 mb-6 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:rotate-12 transition-transform">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-3">
              Initialize <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Identity.</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-purple-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Secure Node Registration</p>
            </div>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest text-red-400">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input 
                name="name" 
                type="text" 
                required 
                placeholder="FULL NAME"
                className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700" 
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700" 
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="ACCESS PASSWORD"
                className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700" 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full group relative overflow-hidden bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all hover:bg-purple-600 hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Syncing Archive...
                  </>
                ) : (
                  <>
                    Establish Connection
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <Link href="/login" className="group flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Existing Clearance?</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 group-hover:text-white transition-colors flex items-center gap-2">
                Return to Login <ArrowRight size={10} />
              </span>
            </Link>
          </div>
        </div>

        {/* System ID Footer */}
        <div className="mt-8 flex justify-center items-center gap-4 opacity-30">
          <div className="h-px w-12 bg-white/20" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-500">System_ID: 254_AUTH_NODE</span>
          <div className="h-px w-12 bg-white/20" />
        </div>
      </div>
    </div>
  );
}