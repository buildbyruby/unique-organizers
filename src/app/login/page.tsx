import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createSession } from '@/lib/auth'

const prisma = new PrismaClient()

// MUST HAVE 'export default'
export default function LoginPage() {
  
  async function login(formData: FormData) {
    "use server"
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.password))) {
      redirect('/login?error=invalid');
    }

    await createSession(user.id, user.role);
    if (user.role === 'ADMIN') redirect('/admin');
    else redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Welcome <span className="text-pink-600">Back</span></h1>
        <form action={login} className="space-y-4">
          <input name="email" type="email" required className="w-full bg-slate-50 p-4 rounded-xl text-sm" placeholder="Email" />
          <input name="password" type="password" required className="w-full bg-slate-50 p-4 rounded-xl text-sm" placeholder="Password" />
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest">Sign In</button>
        </form>
      </div>
    </div>
  )
}