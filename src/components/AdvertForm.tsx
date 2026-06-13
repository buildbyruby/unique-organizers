"use client";

import { useState, useRef } from "react";
import { upsertAdvert } from "@/app/actions";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdvertForm({ initialData }: { initialData?: any }) {
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("imageUrl", imageUrl);
    formData.append("id", initialData?.id || "");
    await upsertAdvert(formData);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{initialData ? "Edit Advert" : "Create New Advert"}</h2>
      <input name="title" defaultValue={initialData?.title} placeholder="Title" className="w-full border p-2" required />
      <textarea name="description" defaultValue={initialData?.description} placeholder="Description" className="w-full border p-2" />
      <input name="link" defaultValue={initialData?.link} placeholder="Target URL" className="w-full border p-2" />
      <div className="flex gap-4">
        <input name="priority" type="number" defaultValue={initialData?.priority || 0} placeholder="Priority" className="w-1/2 border p-2" />
        <input name="duration" type="number" defaultValue={initialData?.duration || 5} placeholder="Seconds" className="w-1/2 border p-2" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Banner Image</label>
        {imageUrl && <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover rounded" />}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2">
          {uploadingImage ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : imageUrl ? "Change Image" : "Upload Image"}
        </button>
      </div>
      <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">
        {loading ? "Saving..." : "Save Advert"}
      </button>
    </form>
  );
}
