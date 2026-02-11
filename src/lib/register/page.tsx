import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSession } from '@/lib/auth'

const prisma = new PrismaClient()

// 1. MUST use 'export default'
// 2. Do NOT put "use server" at the top of this file
export default function RegisterPage() {
  
  async function registerUser(formData: FormData) {
    "use server" // Keep this INSIDE the function
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        redirect('/login?error=exists');
      }

      // Hash and Save
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { 
          email, 
          password: hashedPassword, 
          name, 
          role: 'CLIENT' 
        }
      });

      // Start Session
      await createSession(user.id, user.role);
    } catch (error) {
        console.error("Registration error:", error);
    }

    // Redirect to home after successful registration
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9FA] p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl shadow-pink-100/50 border border-white">
        <div className="mb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
            Create <span className="text-pink-600">Account</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
            Luxury Organizer Management
          </p>
        </div>

        <form action={registerUser} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
            <input name="name" type="text" required className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500 transition-all" placeholder="Jane Doe" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
            <input name="email" type="email" required className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500 transition-all" placeholder="jane@example.com" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Secure Password</label>
            <input name="password" type="password" required className="w-full bg-slate-50 p-5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500 transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm mt-4 hover:bg-pink-600 transition-all shadow-xl shadow-slate-200">
            Register Now
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-600 transition-colors">
            Already have an account? <span className="underline decoration-pink-500 underline-offset-4">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  )
}