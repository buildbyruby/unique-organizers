import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MessageSquare, Trash2, User, Star, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  // Fetching from the Review table instead of Feedback to see Joy's post
  const reviews = await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  async function deleteReview(id: string) {
    'use server'
    try {
      await prisma.review.delete({
        where: { id }
      })
      revalidatePath('/admin/feedback')
    } catch (error) {
      console.error("Failed to delete review:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">Client <span className="text-purple-600">Voices</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Satisfaction Monitoring // v2.1</p>
        </header>

        <div className="grid gap-6">
          {reviews.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-start justify-between gap-8 hover:border-purple-200 transition-all group">
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-tight text-black">{item.userName}</h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> {item.createdAt.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl italic text-slate-700 text-sm leading-relaxed border border-slate-100">
                  "{item.comment}"
                </div>
              </div>

              <form action={async () => { 'use server'; await deleteReview(item.id); }} className="md:self-center">
                <button className="p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 size={20} />
                </button>
              </form>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The feedback log is currently empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}