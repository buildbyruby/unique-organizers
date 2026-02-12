"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
      // THIS IS THE KEY: Physically moving the user based on their role
      if (data.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-[#0a0a0c] p-10 rounded-[2.5rem] border border-white/5">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">
          System <span className="text-purple-600">Access</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="EMAIL_ADDRESS"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all font-mono text-sm"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="ACCESS_KEY"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all font-mono text-sm"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <button className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
            Initialize Session
          </button>
        </form>
      </div>
    </div>
  )
}