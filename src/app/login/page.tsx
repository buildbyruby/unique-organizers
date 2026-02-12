"use client"

import { useState } from "react";
import { login } from "@/app/actions"; // We use our new unified action
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await login(formData);

    if (result.success) {
      window.location.href = result.role === "ADMIN" ? "/admin" : "/";
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Client Access</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Unique Organizers Node</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-[10px] font-bold uppercase">{error}</div>}
          <input name="email" type="email" placeholder="EMAIL" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-purple-500" />
          <input name="password" type="password" placeholder="PASSWORD" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-purple-500" />
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-purple-600 hover:text-white transition">
            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Enter System"}
          </button>
        </form>
      </div>
    </div>
  );
}