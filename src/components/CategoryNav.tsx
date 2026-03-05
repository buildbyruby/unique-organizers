"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        // Ensure we only show top-level categories in the main bar
        const mainCats = data.filter((c: any) => !c.parentId)
        setCategories(mainCats)
      } catch (error) {
        console.error("Failed to load navigation categories:", error)
      }
    }
    load()
  }, [])

  return (
    <nav className="w-full py-4 bg-black border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="relative group"
            onMouseEnter={() => setActiveCategory(cat.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <Link 
              href={`/?category=${cat.id}#catalog`}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition py-2 flex items-center gap-1"
            >
              {cat.name}
            </Link>
            
            {/* Dynamic Subcategory Dropdown - Correctly mapped to children */}
            {activeCategory === cat.id && cat.children && cat.children.length > 0 && (
              <div className="absolute top-full left-0 bg-zinc-900 border border-white/10 p-4 rounded-xl shadow-2xl z-50 min-w-[200px] animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-2">
                  {cat.children.map(sub => (
                    <Link 
                      key={sub.id} 
                      href={`/?category=${sub.id}#catalog`}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-purple-500 flex items-center justify-between group/item"
                    >
                      {sub.name}
                      <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}