"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackAdvertEngagement } from "@/app/actions";

export default function HeroCarousel({ adverts }: { adverts: any[] }) {
  const [index, setIndex] = useState(0);

  // Objective 1: Track Impression on slide change
  useEffect(() => {
    if (adverts.length > 0) {
      trackAdvertEngagement(adverts[index].id, "impression");
    }
  }, [index, adverts]);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % adverts.length);
    }, (adverts[index]?.duration || 5) * 1000);
    return () => clearInterval(timer);
  }, [index, adverts]);

  if (!adverts.length) return null;

  return (
    <div className="relative w-full aspect-[21/9] overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={adverts[index].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={adverts[index].imageUrl} className="w-full h-full object-cover" alt={adverts[index].title} />
          <div className="absolute inset-0 bg-black/30 flex items-center p-12">
            <div className="text-white max-w-xl">
              <h2 className="text-4xl font-bold mb-4">{adverts[index].title}</h2>
              <p className="text-lg mb-6">{adverts[index].description}</p>
              {adverts[index].link && (
                <a 
                  href={adverts[index].link}
                  onClick={() => trackAdvertEngagement(adverts[index].id, "click")}
                  className="bg-orange-500 px-8 py-3 rounded-full font-bold"
                >
                  Shop Now
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}