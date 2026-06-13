"use client";

import React, { useState, useEffect, useRef } from 'react';
import { upsertAdvert, deleteAdvert } from '../actions';
import { 
  Megaphone, Trash2, Edit3, Plus, Image as ImageIcon, 
  Eye, MousePointer2, X, Sparkles, Layout, BarChart3, Rocket, Zap, Globe, Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", link: "", priority: "0", description: "" });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAdverts(); }, []);

  const fetchAdverts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/adverts');
      const data = await response.json();
      setAdverts(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `adverts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditInit = (ad: any) => {
    setEditId(ad.id);
    setFormData({ title: ad.title, imageUrl: ad.imageUrl, link: ad.link || "", priority: ad.priority.toString(), description: ad.description || "" });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", imageUrl: "", link: "", priority: "0", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitData = new FormData(e.currentTarget);
    submitData.set("imageUrl", formData.imageUrl);
    if (editId) submitData.append("id", editId);
    const result = await upsertAdvert(submitData);
    if (result.success) { resetForm(); fetchAdverts(); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 selection:bg-purple-100">
      <header className="w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 px-8 py-6">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-200">
                <Rocket size={20} />
              </div>
              <h1 className="text-3xl font-[1000] tracking-tight uppercase italic flex items-center gap-2">
                Marketing <span className="text-purple-600">Studio</span>
                <span className="text-[10px] not-italic font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 tracking-[0.2em] ml-2">V2.5 PRO</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex gap-10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Assets</span>
                <span className="text-xl font-black text-slate-800 uppercase">{adverts.length} Campaigns</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                <span className="text-xl font-black text-emerald-500 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-8">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-2xl shadow-slate-200/50 p-8 sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="text-purple-500" /> {editId ? "Edit Transmission" : "New Campaign"}
                </h3>
                {editId && <button onClick={resetForm} className="text-red-500 hover:rotate-90 transition-transform"><X size={20}/></button>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full aspect-video rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all group relative overflow-hidden flex flex-col items-center justify-center gap-3"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={24} className="animate-spin text-purple-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Uploading...</span>
                    </>
                  ) : formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} className="w-full h-full object-cover absolute inset-0" alt="preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Change Visual</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-2xl shadow-sm"><ImageIcon size={24} className="text-slate-400" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Banner Asset</span>
                    </>
                  )}
                </button>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Campaign Identity</label>
                    <input
                      name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="CAMPAIGN NAME..." required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                    <textarea
                      name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-300 resize-none"
                      placeholder="Describe this campaign..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Redirect Path</label>
                      <input
                        name="link" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-4 focus:ring-purple-500/10 outline-none"
                        placeholder="/shop/new"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Priority Index</label>
                      <input
                        name="priority" type="number" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-4 focus:ring-purple-500/10 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-purple-600 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-4 group">
                  {editId ? "Update System" : "Execute Launch"}
                  <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                <Globe size={18} className="text-purple-500" /> Active Global Transmissions
              </h3>
            </div>
            <div className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-8">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[3rem]" />)
              ) : adverts.map((ad) => (
                <div key={ad.id} className="group bg-white border border-slate-200/50 rounded-[3rem] p-8 hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.15)] transition-all duration-700 relative overflow-hidden flex flex-col justify-between h-[380px]">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-6">
                    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                      <img src={ad.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={ad.title} />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        Priority {ad.priority}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-purple-600 transition-colors mb-1">{ad.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ad.link || "/home"}</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter">Reach</span>
                        <span className="text-lg font-black text-slate-700">{ad.impressions}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter">Engaged</span>
                        <span className="text-lg font-black text-emerald-500">{ad.clicks}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEditInit(ad)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                        <Edit3 size={20} />
                      </button>
                      <button onClick={async () => { if(confirm('Delete?')) { await deleteAdvert(ad.id); fetchAdverts(); } }} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
