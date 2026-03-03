"use client";

import { useState, useEffect } from "react";
import { upsertAdvert } from "@/app/actions";
import { CldUploadWidget } from "next-cloudinary";

export default function AdvertForm({ initialData }: { initialData?: any }) {
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    // Objective 3: Pass the widget URL to the action
    formData.append("imageUrl", imageUrl);
    formData.append("id", initialData?.id || "");
    
    await upsertAdvert(formData);
    setLoading(false);
    // Add logic to close modal or redirect here
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

      {/* Objective 3: Cloudinary Widget Integration */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Banner Image</label>
        {imageUrl && <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover rounded" />}
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result: any) => setImageUrl(result.info.secure_url)}
        >
          {({ open }) => (
            <button type="button" onClick={() => open()} className="bg-gray-200 px-4 py-2 rounded">
              {imageUrl ? "Change Image" : "Upload Image"}
            </button>
          )}
        </CldUploadWidget>
      </div>

      <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">
        {loading ? "Saving..." : "Save Advert"}
      </button>
    </form>
  );
}