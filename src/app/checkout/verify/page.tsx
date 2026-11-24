"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [trackingLink, setTrackingLink] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setErrorMessage("No payment reference found.");
      return;
    }

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.paid) {
          clearCart();
          setTrackingLink(data.trackingLink);
          setStatus("success");
          setTimeout(() => {
            router.push(`/orders/${data.trackingLink}`);
          }, 2500);
        } else {
          setStatus("failed");
          setErrorMessage(data.error || "Payment was not completed.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setErrorMessage("Could not verify payment. Please contact support.");
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0d0d10] border border-white/10 rounded-3xl p-8 text-center space-y-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tight">Verifying Payment...</h1>
            <p className="text-sm text-gray-400">Confirming your Paystack transaction. Hold tight.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-black uppercase tracking-tight">Payment Confirmed</h1>
            <p className="text-sm text-gray-400">
              Your order is confirmed and being prepared for dispatch. Redirecting to live tracking...
            </p>
            {trackingLink && (
              <Link
                href={`/orders/${trackingLink}`}
                className="inline-flex items-center gap-2 bg-white text-black font-black uppercase text-xs px-6 py-3 rounded-xl hover:bg-purple-500 hover:text-white transition"
              >
                Track Order Now <ArrowRight size={14} />
              </Link>
            )}
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tight">Payment Incomplete</h1>
            <p className="text-sm text-gray-400">{errorMessage}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-black font-black uppercase text-xs px-6 py-3 rounded-xl hover:bg-purple-500 hover:text-white transition"
            >
              Return to Store <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
