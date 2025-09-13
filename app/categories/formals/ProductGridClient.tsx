"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type ProductType = "SHIRT" | "PANTS";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrpPrice?: number;
  imageUrl: string;
  type: ProductType;
  rating: number;
};

const isMobileWidth = () => typeof window !== "undefined" && window.innerWidth < 768;

export default function ProductGridClient({ products }: { products: Product[] }) {
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [visibleCount, setVisibleCount] = useState(() => (isMobileWidth() ? 8 : 20));

  // adjust on resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount((prev) => {
        const target = isMobileWidth() ? 8 : 20;
        return prev < target ? prev : target;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = useMemo(
    () => (selectedType ? products.filter((p) => p.type === selectedType) : products),
    [selectedType, products]
  );

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="min-h-screen px-3 sm:px-6">
      {/* Selection cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {["SHIRT", "PANTS"].map((type) => (
          <div
            key={type}
            onClick={() => setSelectedType(selectedType === type ? null : (type as ProductType))}
            className={`cursor-pointer border p-3 rounded-lg shadow transition text-center ${
              selectedType === type ? "bg-black text-white" : "bg-transparent text-slate-900"
            }`}
          >
            <h2 className="text-base font-semibold">{type.charAt(0) + type.slice(1).toLowerCase()}</h2>
            <p className="text-xs">Explore our {type.toLowerCase()}s</p>
          </div>
        ))}
      </div>

      {/* Heading */}
      <div className="mt-2 mb-4">
        <h2 className="text-xl font-semibold text-center text-slate-900">
          {selectedType ? `Available ${selectedType.toLowerCase()}s` : "Top Formals"}
        </h2>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="rounded-lg shadow-md hover:shadow-lg flex flex-col h-full cursor-pointer p-3 bg-white transition-transform duration-150 hover:scale-[1.02]">
                <div className="w-full max-w-[160px] aspect-square rounded-lg overflow-hidden mb-2 mx-auto">
                  <Image
                    src={product.imageUrl || "/fallback.jpg"}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <h3 className="text-sm font-semibold text-center mb-1 overflow-hidden text-ellipsis text-black">
                  {product.name}
                </h3>
                <div className="flex justify-center mb-1">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-[12px] ${product.rating > index ? "text-yellow-500" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="flex justify-center items-center gap-2 text-sm mt-auto">
                  {product.mrpPrice && <p className="line-through text-gray-400">₹{product.mrpPrice.toFixed(0)}</p>}
                  <p className="font-bold text-base text-black">₹{product.price.toFixed(0)}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center text-center h-48">
            <p className="text-center text-base text-black">No products available.</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() =>
              setVisibleCount((v) => Math.min(v + (isMobileWidth() ? 8 : 20), filteredProducts.length))
            }
            className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-yellow-500 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
