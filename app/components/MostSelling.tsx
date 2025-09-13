"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  mrpPrice: number | null;
  price: number;
  rating: number | null;
}

const Star = ({ filled }: { filled: "full" | "half" | "empty" }) => {
  if (filled === "full") return <FaStar className="text-yellow-500" />;
  if (filled === "half") return <FaStarHalfAlt className="text-yellow-500" />;
  return <FaRegStar className="text-gray-300" />;
};

function renderStars(rating: number | null) {
  const avg = rating || 0;
  const fullStars = Math.floor(avg);
  const remainder = avg - fullStars;
  const hasHalf = remainder >= 0.25 && remainder < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-sm">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} filled="full" />
      ))}
      {hasHalf && <Star filled="half" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} filled="empty" />
      ))}
    </div>
  );
}

export default function MostSellingSlider({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Sort products by rating descending
  const sortedProducts = [...products].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0)
  );

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sortedProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sortedProducts.length]);

  // Determine visible products
  let visibleProducts: Product[];
  if (isMobile) {
    // Mobile: show 1 random product
    visibleProducts = [sortedProducts[Math.floor(Math.random() * sortedProducts.length)]];
  } else {
    // Desktop: always show 3 products in a row
    visibleProducts = [];
    for (let i = 0; i < 3; i++) {
      visibleProducts.push(sortedProducts[(index + i) % sortedProducts.length]);
    }
  }

  return (
    <section className="w-full bg-white py-20 overflow-hidden min-h-[85vh] md:h-[70vh] mb-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-black">
        Most Selling Products
      </h2>

      <div className="flex justify-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
        {visibleProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden w-[90%] sm:w-[45%] md:w-[30%]"
          >
            <div className="relative w-full h-[250px] md:h-[200px]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="p-3 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                {product.name}
              </h3>
              <div className="flex justify-center gap-1 items-center mt-1">
                {renderStars(product.rating)}
                {product.rating && (
                  <span className="text-sm text-gray-500">
                    {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex justify-center gap-2 items-center mt-1">
                {product.mrpPrice && (
                  <span className="line-through text-gray-400 text-base md:text-lg">
                    ₹{product.mrpPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-lg md:text-xl font-bold text-black">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
              <Link href={`/product/${product.id}`}>
                <button className="mt-3 px-4 py-2 text-sm md:text-base font-semibold uppercase border border-black bg-black text-white hover:bg-white hover:text-black transition-all duration-300">
                  Shop Now
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}