'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ProductType = 'BLAZERS' | 'COAT';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrpPrice?: number;
  imageUrl: string;
  type: ProductType;
  rating: number;
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const isMobileWidth = () => typeof window !== 'undefined' && window.innerWidth < 768;

export default function ProductGridClient({ products }: { products: Product[] }) {
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [visibleCount, setVisibleCount] = useState(() => (isMobileWidth() ? 9 : 25));

  // adjust on resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount((prev) => {
        const target = isMobileWidth() ? 9 : 25;
        return prev < target ? prev : target;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = useMemo(
    () => (selectedType ? products.filter((p) => p.type === selectedType) : products),
    [selectedType, products]
  );

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleSelection = (type: ProductType) => {
    setSelectedType((prev) => (prev === type ? null : type));
    setVisibleCount(isMobileWidth() ? 9 : 25);
  };

  return (
    <div className="min-h-screen px-3 sm:px-6">
      {/* Selection cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          onClick={() => handleSelection('BLAZERS')}
          className={`cursor-pointer border p-3 rounded-lg shadow transition text-center ${
            selectedType === 'BLAZERS' ? 'bg-black text-white' : 'bg-transparent text-slate-900'
          }`}
        >
          <h2 className="text-base font-semibold">Blazers</h2>
          <p className="text-xs">Explore premium blazers</p>
        </div>

        <div
          onClick={() => handleSelection('COAT')}
          className={`cursor-pointer border p-3 rounded-lg shadow transition text-center ${
            selectedType === 'COAT' ? 'bg-black text-white' : 'bg-transparent text-slate-900'
          }`}
        >
          <h2 className="text-base font-semibold">Coats</h2>
          <p className="text-xs">Explore stylish coats</p>
        </div>
      </div>

      {/* Heading */}
      <div className="mt-2 mb-4">
        <h2 className="text-xl font-semibold text-center text-slate-900">
          {selectedType ? `Available ${titleCase(selectedType.toLowerCase())}s` : 'Blazers & Coats'}
        </h2>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-label={`View ${product.name}`}
              className="group"
            >
              <div className="rounded-lg shadow-md hover:shadow-lg flex flex-col h-full cursor-pointer p-3 bg-white transition-transform duration-150 hover:scale-[1.02]">
                {/* Image */}
                <div className="w-full max-w-[160px] aspect-square rounded-lg overflow-hidden mb-2 mx-auto">
                  <Image
                    src={product.imageUrl || '/fallback.jpg'}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-center mb-1 overflow-hidden text-ellipsis text-black">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex justify-center mb-1">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-[12px] ${
                        product.rating > index ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex justify-center items-center gap-2 text-sm mt-auto">
                  {product.mrpPrice && (
                    <p className="line-through text-gray-400">₹{product.mrpPrice.toFixed(0)}</p>
                  )}
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
              setVisibleCount((v) =>
                Math.min(v + (isMobileWidth() ? 9 : 25), filteredProducts.length)
              )
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
