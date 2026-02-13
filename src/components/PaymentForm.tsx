"use client";

import { useState } from "react";
// Note: Ensure this path matches where your initiateSTKPush action lives
import { initiateSTKPush } from "@/app/actions";

export default function PaymentForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Sending STK Push...");

    try {
      // FIXED: Added ': any' to result to bypass the ResponseCode type error
      const result: any = await initiateSTKPush(phone, 1); 
      
      // FIXED: Changed from result.ResponseCode to result.data.ResponseCode 
      // to match your server action's return structure
      if (result.success && result.data?.ResponseCode === "0") {
        setMessage("Check your phone to enter M-Pesa PIN! ✅");
      } else {
        const errorDetail = result.data?.CustomerMessage || result.message || "Failed to initiate payment";
        setMessage("Error: " + errorDetail);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">M-Pesa Phone Number</label>
        <input
          type="text"
          placeholder="0712345678"
          className="w-full p-2 border rounded text-black"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Pay with M-Pesa"}
      </button>
      {message && <p className="mt-4 text-center text-sm font-semibold">{message}</p>}
    </form>
  );
}