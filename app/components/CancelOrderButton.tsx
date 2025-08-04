"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  orderId: string;
  onCancelled?: (orderId: string) => void;
};

export default function CancelOrderButton({ orderId, onCancelled }: Props) {
  const [loading, setLoading] = useState(false);

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/order/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to cancel order");

      toast.success("Order cancelled. Our team will get back to you soon for the refund.");
      if (onCancelled) onCancelled(orderId);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={cancelOrder}
      disabled={loading}
      aria-label="Cancel order"
      className={`relative flex items-center gap-2 border rounded-lg px-4 py-1 text-sm font-medium transition ${
        loading
          ? "border-gray-300 text-gray-400 cursor-not-allowed"
          : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
      }`}
    >
      {loading && (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      Cancel Order
    </button>
  );
}
