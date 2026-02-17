"use client";

import { useState } from "react";
import { initiateSTKPush } from "@/app/actions";

export default function PaymentForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return alert("Please enter a valid phone number");

    setLoading(true);
    setMessage("Redirecting to WhatsApp Support...");

    try {
      // Call the action to satisfy the code but handle the actual order via WhatsApp
      await initiateSTKPush(phone, 1); 
      
      const myNumber = "254797517565"; 
      const wpMessage = encodeURIComponent(`Hello Unique Organizers! I want to make a payment. My phone is ${phone}`);
      
      window.open(`https://wa.me/${myNumber}?text=${wpMessage}`, '_blank');
      
      setMessage("Please complete your order on WhatsApp ✅");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Phone Number</label>
        <input
          type="text"
          placeholder="0797517565"
          className="w-full p-2 border rounded text-black outline-none focus:ring-2 focus:ring-pink-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded font-bold hover:bg-green-600 transition-colors disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Order via WhatsApp"}
      </button>
      {message && <p className="mt-4 text-center text-sm font-semibold text-pink-600">{message}</p>}
    </form>
  );
}