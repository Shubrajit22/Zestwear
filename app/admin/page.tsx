"use client";

import Link from "next/link";
import { Users, Package, ClipboardList, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const links = [
    { href: "/admin/users", label: "Manage Users", icon: <Users className="w-6 h-6" /> },
    { href: "/admin/orders", label: "Manage Orders", icon: <ClipboardList className="w-6 h-6" /> },
    { href: "/admin/products", label: "Manage Products", icon: <Package className="w-6 h-6" /> },
    { href: "/admin/reviews", label: "Manage Reviews", icon: <Star className="w-6 h-6" /> },
    { href: "/admin/uploads", label: "Manage Images", icon: <Star className="w-6 h-6" /> },
  ];

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-white tracking-wide">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {links.map(({ href, label, icon }, index) => (
            <motion.div
              key={href}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={href}
                className="flex items-center gap-4 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-3 bg-yellow-500 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-white text-lg font-semibold">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
