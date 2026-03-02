"use client";

import { useState } from "react";
import { sendFeedback } from "@/app/actions"; 
import { Send, CheckCircle2, Image as ImageIcon, X } from "lucide-react";

export default function FeedbackForm() {
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("LOADING");
    const res = await sendFeedback(formData);
    if (res.success) {
      setStatus("SUCCESS");
      setPreview(null);
      setTimeout(() => setStatus("IDLE"), 5000);
    } else {
      setStatus("ERROR");
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-xl">
      <div className="mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">Client Feedback</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mt-2">Share your acquisition experience</p>
      </div>

      {status === "SUCCESS" ? (
        <div className="py-12 flex flex-col items-center text-center space-y-4">
          <CheckCircle2 size={60} className="text-green-500" />
          <p className="font-black uppercase tracking-widest text-slate-900">Feedback Published</p>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <input name="name" required placeholder="YOUR NAME" className="bg-white/50 border border-slate-200 rounded-2xl py-4 px-6 text-[10px] font-black uppercase focus:border-purple-300 outline-none" />
            <input name="orderId" placeholder="ORDER ID (OPTIONAL)" className="bg-white/50 border border-slate-200 rounded-2xl py-4 px-6 text-[10px] font-black uppercase focus:border-purple-300 outline-none" />
          </div>
          
          <textarea name="message" required placeholder="TELL US ABOUT THE PRODUCT & DELIVERY QUALITY..." rows={4} className="w-full bg-white/50 border border-slate-200 rounded-[2rem] py-4 px-6 text-[10px] font-black uppercase focus:border-purple-300 outline-none resize-none" />

          <div className="relative">
            {preview ? (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-purple-500">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPreview(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
              </div>
            ) : (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center group-hover:border-purple-500 transition-all">
                  <ImageIcon size={18} className="text-slate-400 group-hover:text-purple-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Attach Product Image</span>
                <input type="file" name="image" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <button type="submit" disabled={status === "LOADING"} className="w-full bg-slate-900 text-white py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {status === "LOADING" ? "TRANSMITTING..." : <>SUBMIT FEEDBACK <Send size={14} /></>}
          </button>
        </form>
      )}
    </div>
  );
}