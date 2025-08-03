'use client';

import { useEffect, useState } from 'react';
import { getNumericOrderId } from '@/lib/utils';
import Image from 'next/image';

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
  createdAt: string;
  orderItems: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const updateShippingStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, shippingStatus: newStatus }),
    });
    await fetchOrders();
    setUpdating(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto mt-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">🛒 Admin - All Orders</h1>
      {loading ? (
        <p className="text-center text-lg text-black">Loading orders...</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-lg p-6 rounded-2xl border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">
                  Order #{getNumericOrderId(order.id)}
                </h2>
                <p className="text-sm text-black">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4 text-black">
                <p><span className="font-semibold">User:</span> {order.user.name}</p>
                <p><span className="font-semibold">Email:</span> {order.user.email}</p>
                <p><span className="font-semibold">Mobile:</span> {order.user.mobile}</p>
                <p><span className="font-semibold">Shipping Address:</span> {order.shippingAddress}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold text-green-600">Total: ₹{order.totalAmount}</p>
              </div>

              <div className="mb-4">
                <label className="font-medium text-sm mr-2 text-black">Shipping Status:</label>
                <select
                  value={order.shippingStatus}
                  onChange={(e) => updateShippingStatus(order.id, e.target.value)}
                  className="border rounded px-3 py-1 text-sm text-black"
                  disabled={updating === order.id}
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-lg text-black">Items:</h3>
                <ul className="space-y-4">
                  {order.orderItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:justify-between gap-4 border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 relative rounded overflow-hidden">
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
                        <div>
                          <p className="font-bold text-base text-black">{item.product.name}</p>
                          <p className="text-xs text-black">
                            Size: {item.size || 'N/A'} | Qty: {item.quantity}
                          </p>
                          <div className="text-xs mt-1 text-black">
                            <p>Color: {item.product.color || 'N/A'}</p>
                            <p>Type: {item.product.type}</p>
                            <p>Texture: {item.product.texture || 'N/A'}</p>
                            <p>Neckline: {item.product.neckline || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-green-600">
                        ₹{item.price}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
