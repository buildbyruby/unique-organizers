'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh(); // Refresh to update middleware state
      } else {
        setError('Access Denied: Invalid Credentials');
      }
    } catch (err) {
      setError('System Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-purple-500">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Restricted Access</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Unique Organizers // Command Center
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2rem] shadow-2xl">
          
          <div className="mb-6">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 pl-2">
              Security Key
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER ADMIN PASSWORD"
                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder-gray-700 outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="mt-8 text-center">
             <p className="text-[8px] text-gray-600 uppercase tracking-widest">
               Unauthorized access attempts are logged.
               <br />Server ID: 254_SECURE_NODE
             </p>
          </div>
        </form>
      </div>
    </div>
  );
}