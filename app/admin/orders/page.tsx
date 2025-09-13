"use client";

import { useEffect, useMemo, useState } from "react";
import { getNumericOrderId } from "@/lib/utils";
import Image from "next/image";
import { toast } from "react-hot-toast";

type Product = {
  name: string;
  color?: string;
  type: string;
  texture?: string;
  neckline?: string;
  stockImages: { imageUrl: string }[];
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  price: number;
  product: Product;
};

type User = {
  name: string;
  email: string;
  mobile: string;
};

type Order = {
  id: string;
  user: User;
  shippingAddress: string;
  totalAmount: number;
  shippingStatus: string;
  paymentStatus: string;
  upiTransactionId?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateShippingStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shippingStatus: newStatus }),
      });
      await fetchOrders();
      toast.success("Shipping status updated");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setUpdating(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });
      await fetchOrders();
      toast.success("Payment status updated");
    } catch (error) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  };

  const markAsSuspicious = async (orderId: string) => {
    if (confirm("Are you sure you want to mark this order as suspicious? This will flag it for review.")) {
      await updatePaymentStatus(orderId, "suspicious");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm.trim()) {
      const normalized = searchTerm.trim();
      filtered = filtered.filter((order) =>
        getNumericOrderId(order.id).toString().includes(normalized) ||
        order.upiTransactionId?.toLowerCase().includes(normalized.toLowerCase()) ||
        order.user.email.toLowerCase().includes(normalized.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.shippingStatus === filterStatus);
    }

    // Payment filter
    if (filterPayment !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === filterPayment);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm, filterStatus, filterPayment]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "suspicious": return "bg-red-100 text-red-800";
      case "verified": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "out-for-delivery": return "bg-purple-100 text-purple-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto mt-20">
      <h1 className="text-4xl font-bold mb-4 text-center text-black">
        🛒 Admin - Order Management & UPI Verification
      </h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Order #, UPI ID, or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="suspicious">Suspicious</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchOrders}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Refresh Orders
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Total Orders: <span className="font-semibold">{filteredOrders.length}</span>
          {" "} | Suspicious: <span className="font-semibold text-red-600">
            {filteredOrders.filter(o => o.paymentStatus === 'suspicious').length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white mt-2">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white text-lg">No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white shadow-lg p-6 rounded-2xl border-2 transition-all ${
                order.paymentStatus === 'suspicious' ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-black">
                      Order #{getNumericOrderId(order.id)}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getShippingStatusColor(order.shippingStatus)}`}>
                      {order.shippingStatus?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Placed: {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                
                <div className="mt-4 lg:mt-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>
              </div>

             {/* Customer & Payment Info */}
<div className="grid md:grid-cols-2 gap-6 mb-6">
  {/* Customer Details */}
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-semibold text-lg mb-3 text-black">Customer Details</h3>
    <div className="space-y-2 text-sm text-black">
      <p><span className="font-medium">Name:</span> {order.user.name}</p>
      <p><span className="font-medium">Email:</span> {order.user.email}</p>
      <p><span className="font-medium">Mobile:</span> {order.user.mobile || 'N/A'}</p>
      <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
    </div>
  </div>

  {/* Payment + Shipping Controls */}
  <div className="bg-blue-50 rounded-lg p-4">
    <h3 className="font-semibold text-lg mb-3 text-black">Payment & Shipping</h3>
    <div className="space-y-4">
      {/* UPI Transaction ID */}
      <div>
        <p className="text-sm font-medium text-gray-700">UPI Transaction ID:</p>
        {order.upiTransactionId ? (
          <div className="flex items-center gap-2 mt-1">
            <code className="bg-white px-2 py-1 rounded text-sm font-mono border text-black">
              {order.upiTransactionId}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.upiTransactionId!);
                toast.success("Transaction ID copied!");
              }}
              className="text-blue-600 hover:text-blue-800 text-xs"
              title="Copy Transaction ID"
            >
              📋
            </button>
          </div>
        ) : (
          <p className="text-red-500 text-sm font-medium">No Transaction ID provided</p>
        )}
      </div>

      {/* Payment Status Controls */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Payment Verification:</p>
        <div className="flex gap-2">
          <select
            value={order.paymentStatus}
            onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
            className="text-xs border rounded px-2 py-1 flex-1 text-black"
            disabled={updating === order.id}
          >
            <option value="pending">Pending Verification</option>
            <option value="paid">Paid (Unverified)</option>
            <option value="verified">Verified ✓</option>
            <option value="suspicious">Suspicious ⚠️</option>
          </select>
          {order.paymentStatus !== 'suspicious' && (
            <button
              onClick={() => markAsSuspicious(order.id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200"
              title="Mark as suspicious"
            >
              🚩 Flag
            </button>
          )}
        </div>
      </div>

      {/* 🚀 Shipping Status (moved inside here) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Shipping Status:</p>
        <select
          value={order.shippingStatus}
          onChange={(e) => updateShippingStatus(order.id, e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full text-black"
          disabled={updating === order.id}
        >
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out-for-delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Verification Hints */}
      {order.upiTransactionId && (
        <div className="bg-yellow-50 p-3 rounded text-xs">
          <p className="font-medium text-yellow-800 mb-1">Verification Steps:</p>
          <ul className="text-yellow-700 space-y-1 list-disc list-inside">
            <li>Check UPI app transaction history</li>
            <li>Verify amount matches: ₹{order.totalAmount}</li>
            <li>Confirm transaction timestamp</li>
            <li>Cross-check with bank statement if needed</li>
          </ul>
        </div>
      )}
    </div>
  </div>
</div>


              {/* Shipping Status */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-semibold text-lg text-black">Shipping Status</h3>
                  <select
                    value={order.shippingStatus}
                    onChange={(e) => updateShippingStatus(order.id, e.target.value)}
                    className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
                    disabled={updating === order.id}
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out-for-delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-black">
                  Items ({order.orderItems.length})
                </h3>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                        {item.product.stockImages?.[0]?.imageUrl ? (
                          <Image
                            src={item.product.stockImages[0].imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs text-black">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-black mb-1">
                          {item.product.name}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                          <p><span className="font-medium">Size:</span> {item.size || "N/A"}</p>
                          <p><span className="font-medium">Qty:</span> {item.quantity}</p>
                          <p><span className="font-medium">Color:</span> {item.product.color || "N/A"}</p>
                          <p><span className="font-medium">Type:</span> {item.product.type}</p>
                        </div>
                        {(item.product.texture || item.product.neckline) && (
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-1">
                            {item.product.texture && <p><span className="font-medium">Texture:</span> {item.product.texture}</p>}
                            {item.product.neckline && <p><span className="font-medium">Neckline:</span> {item.product.neckline}</p>}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">per item</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}