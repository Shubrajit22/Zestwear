"use client";

import Link from "next/link";
import { Users, Package, ClipboardList, Star } from "lucide-react";

export default function AdminDashboard() {
  const links = [
    { href: "/admin/users", label: "Manage Users", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/orders", label: "Manage Orders", icon: <ClipboardList className="w-5 h-5" /> },
    { href: "/admin/products", label: "Manage Products", icon: <Package className="w-5 h-5" /> },
    { href: "/admin/reviews", label: "Manage Reviews", icon: <Star className="w-5 h-5" /> },
    { href: "/admin/uploads", label: "Manage Images", icon: <Star className="w-5 h-5" /> },
  ];

return (
  <div className="w-full min-h-screen bg-black flex items-center justify-center">
    <div className="w-full max-w-3xl p-6 bg-black">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-100">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 shadow hover:shadow-md transition-all hover:bg-blue-50"
          >
            <span className="text-blue-600">{icon}</span>
            <span className="text-lg font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);
}