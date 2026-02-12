"use client"

import { useState } from "react";
import { login } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    
    // Call the Server Action directly
    const result = await login(formData);

    if (result.success) {
      // Force a hard refresh to update the middleware/cookies
      window.location.href = "/admin"; 
    } else {
      setError(result.message || "Invalid credentials");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">Restricted Area</p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                name="email"
                type="email"
                required
                placeholder="ADMIN ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm font-bold tracking-wide"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                placeholder="PASSKEY"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm font-bold tracking-wide"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-xs font-black uppercase tracking-[0.2em] text-black bg-white hover:bg-purple-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}