"use client";

import { useState } from "react";
import Image from "next/image";
import { getNumericOrderId } from "@/lib/utils";
import CancelOrderButton from "../components/CancelOrderButton";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  totalAmount: number;
  orderItems: OrderItem[];
}

export default function OrdersPageClient({
  orders,
  userEmail,
}: {
  orders: Order[];
  userEmail: string;
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

  const handleReturnRequest = async () => {
    if (!selectedOrder) return;
    if (!returnReason.trim()) {
      toast.error("Please enter a reason for return.");
      return;
    }

    try {
      const res = await fetch("/api/order/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        orderId: selectedOrder.id,
        userEmail: userEmail,
        reason: returnReason,
        }),

      });

      if (res.ok) {
        toast.success("Return request submitted successfully.");
        setSelectedOrder(null);
        setReturnReason("");
      } else {
        toast.error("Failed to submit return request.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center text-center">
        <p className="text-xl text-gray-600">No orders found.</p>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <main className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center text-gray-900">
          Your Orders
        </h1>

        <div className="space-y-8">
          {orders.map((order) => {
            const isReturnable =
              (order.status?.toLowerCase() === "delivered" ||
                order.shippingStatus?.toLowerCase() === "delivered") &&
              Date.now() - new Date(order.createdAt).getTime() <=
                7 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order <span className="text-indigo-600">#{getNumericOrderId(order.id)}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-xl font-semibold text-gray-800">
                    ₹{order.totalAmount}
                  </div>
                </div>

                {/* Items */}
                <div className="grid gap-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-gray-50 rounded-lg p-3"
                    >
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <div className="text-sm text-gray-600 flex flex-wrap gap-4 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>Size: {item.size || "N/A"}</span>
                          <span>Price: ₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status and Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-5">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {order.paymentStatus.toLowerCase() === "confirmed"
                        ? "Paid"
                        : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                        {order.shippingStatus.charAt(0).toUpperCase() + order.shippingStatus.slice(1)}
                    </span>

                  {order.shippingStatus === "processing" &&
                    order.status !== "cancelled" && (
                      <CancelOrderButton orderId={order.id} />
                    )}

                  {isReturnable && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="ml-auto px-4 py-1.5 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Return Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Return Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Order</h2>
            <p className="text-gray-700 mb-3">
              Why do you want to return order #{getNumericOrderId(selectedOrder.id)}?
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your reason..."
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}