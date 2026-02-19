"use client";

import { useState } from "react";
import { sendFeedback } from "@/app/actions";
import { Send, CheckCircle2 } from "lucide-react";

export default function FeedbackForm() {
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");

  async function handleSubmit(formData: FormData) {
    setStatus("LOADING");
    const res = await sendFeedback(formData);
    if (res.success) {
      setStatus("SUCCESS");
      setTimeout(() => setStatus("IDLE"), 5000);
    } else {
      setStatus("ERROR");
    }
  }

  return (
    <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-xl">
      <div className="mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">Client Inquiries</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mt-2">Direct Channel to Management</p>
      </div>

      {status === "SUCCESS" ? (
        <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <CheckCircle2 size={60} className="text-green-500" />
          <p className="font-black uppercase tracking-widest text-slate-900">Transmission Received</p>
          <p className="text-xs text-slate-500 font-medium">Our team will process your message shortly.</p>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <input 
              name="name"
              placeholder="YOUR IDENTITY" 
              className="bg-white/50 border border-slate-200 rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-purple-300 outline-none transition-all"
            />
            <input 
              name="email"
              type="email"
              placeholder="CONTACT EMAIL" 
              className="bg-white/50 border border-slate-200 rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-purple-300 outline-none transition-all"
            />
          </div>
          <textarea 
            name="message"
            required
            placeholder="HOW CAN WE ASSIST YOUR SPACE?" 
            rows={4}
            className="w-full bg-white/50 border border-slate-200 rounded-[2rem] py-4 px-6 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-purple-300 outline-none transition-all resize-none"
          />
          <button 
            type="submit"
            disabled={status === "LOADING"}
            className="w-full bg-slate-900 text-white py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {status === "LOADING" ? "TRANSMITTING..." : (
              <>SEND MESSAGE <Send size={14} /></>
            )}
          </button>
          {status === "ERROR" && (
            <p className="text-center text-red-500 text-[9px] font-black uppercase tracking-widest">System Error: Please try again</p>
          )}
        </form>
      )}
    </div>
  );
}