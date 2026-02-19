"use client";

import { useState } from 'react';
import { Star, Send, UserCircle } from 'lucide-react';
import { submitReview } from '@/app/actions';

export default function PublicReviews({ reviews }: { reviews: any[] }) {
  const [rating, setRating] = useState(5);
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    await submitReview(formData);
    setIsPending(false);
    (document.getElementById("review-form") as HTMLFormElement).reset();
    setRating(5);
  }

  return (
    <section className="py-24 px-8 bg-slate-50 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
              Rate Your <span className="text-purple-600">Experience</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Visible to all Elite Members</p>
            
            <form id="review-form" action={handleAction} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
              <div className="mb-6">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">Service Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button key={num} type="button" onClick={() => setRating(num)} className={`transition-all ${rating >= num ? 'text-yellow-400' : 'text-slate-200'}`}>
                      <Star size={24} fill={rating >= num ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <input type="hidden" name="rating" value={rating} />
              </div>

              <input name="userName" placeholder="YOUR NAME" className="w-full bg-slate-50 rounded-xl p-4 text-[10px] font-black mb-4 outline-none focus:ring-2 ring-purple-500" />
              <textarea name="comment" required placeholder="FEEDBACK ON PRODUCTS/SERVICE..." className="w-full bg-slate-50 rounded-xl p-4 text-[10px] font-black mb-6 outline-none focus:ring-2 ring-purple-500 min-h-[120px] resize-none" />
              
              <button disabled={isPending} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50">
                {isPending ? "POSTING..." : <><Send size={14} /> Post Review</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Client Testimonials</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 text-xs font-bold leading-relaxed mb-6 italic">"{r.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><UserCircle size={16} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">{r.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}