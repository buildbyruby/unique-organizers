"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEngagement } from "@/app/actions";

export default function HeroCarousel({ adverts }: { adverts: any[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const duration = (adverts[index]?.duration || 5) * 1000;

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % adverts.length);
    setProgress(0);
  }, [adverts.length]);

  useEffect(() => {
    if (adverts?.length > 0) trackEngagement(adverts[index]["id"], "impression");
  }, [index, adverts]);

  useEffect(() => {
    if (!adverts?.length) return;
    const timer = setInterval(next, duration);
    return () => clearInterval(timer);
  }, [index, adverts, next, duration]);

  useEffect(() => {
    if (!adverts?.length) return;
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / duration) * 100, 100));
    }, 50);
    return () => clearInterval(interval);
  }, [index, duration, adverts]);

  if (!adverts?.length) return null;
  const ad = adverts[index];

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-900 mx-auto">
      <div className="relative aspect-[21/9] md:aspect-[32/9] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={ad["id"]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img src={ad["imageUrl"]} className="w-full h-full object-cover" alt={ad["title"]} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/40 border border-purple-500/50 text-[9px] font-black uppercase tracking-[0.3em] text-purple-100 w-fit mb-4 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Featured Partner
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-tight mb-4">{ad["title"]}</h2>
                {ad["description"] && <p className="text-slate-200 text-sm md:text-lg font-medium max-w-md line-clamp-2 mb-6">{ad["description"]}</p>}
                {ad["link"] && (
                  <a href={ad["link"]} onClick={() => trackEngagement(ad["id"], "click")}
                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-xl">
                    Shop Now
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-purple-500 transition-all" style={{ width: progress + "%" }} />
        </div>
      </div>
      {adverts.length > 1 && (
        <div className="flex gap-3 p-4 bg-black/60 backdrop-blur-md overflow-x-auto">
          {adverts.map((a: any, i: number) => (
            <button key={a["id"]} onClick={() => { setIndex(i); setProgress(0); }}
              className={`relative flex-shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === index ? "border-purple-500 scale-105" : "border-white/10 opacity-50 hover:opacity-100"}`}>
              <img src={a["imageUrl"]} className="w-full h-full object-cover" alt={a["title"]} />
              <p className="absolute bottom-1 left-1 right-1 text-[8px] font-black uppercase text-white truncate">{a["title"]}</p>
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto pr-2">
            {adverts.map((_: any, i: number) => (
              <button key={i} onClick={() => { setIndex(i); setProgress(0); }}
                className={`rounded-full transition-all duration-300 ${i === index ? "w-6 h-2 bg-purple-500" : "w-2 h-2 bg-white/30"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}