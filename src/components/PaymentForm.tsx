"use client";

import { useState } from "react";
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
      // Calling your server action from actions.ts
      const result = await initiateSTKPush(phone, 1); // Amount hardcoded to 1 per your action logic
      
      if (result.ResponseCode === "0") {
        setMessage("Check your phone to enter M-Pesa PIN!");
      } else {
        setMessage("Error: " + (result.CustomerMessage || "Failed to initiate payment"));
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