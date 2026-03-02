import prisma from '@/lib/prisma'
import { upsertAdvert, deleteAdvert } from '../actions'
import { Megaphone, Trash2, ExternalLink, Plus, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdvertsPage() {
  const adverts = await prisma.advert.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Marketing <span className="text-purple-600">Assets</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Boutique Advert Manager // v2.1</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* CREATE FORM */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8">
              <Plus size={16} className="text-purple-600" /> New Campaign
            </h3>
            <form action={upsertAdvert} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Campaign Title</label>
                <input name="title" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600" placeholder="e.g. SUMMER CLEARANCE" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Banner Image URL</label>
                <input name="imageUrl" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600" placeholder="https://..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Destination Link</label>
                <input name="link" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600" placeholder="/product/id..." />
              </div>
              {/* HIDDEN LOGIC TO MATCH SCHEMA.PRISMA DURATION REQUIREMENT */}
              <input type="hidden" name="type" value="HERO" />
              <input type="hidden" name="duration" value="30" />
              <input type="hidden" name="isActive" value="true" />
              
              <button className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all">Launch Campaign</button>
            </form>
          </div>

          {/* LIST VIEW */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 px-4">
              <Megaphone size={16} /> Active Transmissions
            </h3>
            <div className="grid gap-4">
              {adverts.map((ad) => (
                <div key={ad.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center justify-between group overflow-hidden">
                  <div className="flex items-center gap-6">
                    <img src={ad.imageUrl} className="w-32 h-20 object-cover rounded-xl bg-slate-100 grayscale group-hover:grayscale-0 transition-all" />
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-tight">{ad.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Type: {ad.type}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {ad.clicks} Clicks
                        </span>
                      </div>
                    </div>
                  </div>
                  <form action={async () => { 'use server'; await deleteAdvert(ad.id); }}>
                    <button className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              ))}
              {adverts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <ImageIcon size={40} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No campaigns found in database</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}