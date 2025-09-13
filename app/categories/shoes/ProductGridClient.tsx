'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ProductType = 'SPORTS' | 'CASUAL' | 'FORMAL';

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

  const filtered = useMemo(
    () => (selectedType ? products.filter((p) => p.type === selectedType) : products),
    [selectedType, products]
  );

  const visibleProducts = filtered.slice(0, visibleCount);

  const handleSelection = (type: ProductType) => {
    setSelectedType((prev) => (prev === type ? null : type));
    setVisibleCount(isMobileWidth() ? 9 : 25);
  };

  return (
    <div className="min-h-screen px-3 sm:px-6">
      {/* Type selection buttons */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {(['SPORTS', 'CASUAL', 'FORMAL'] as ProductType[]).map((type) => (
          <div
            key={type}
            onClick={() => handleSelection(type)}
            className={`cursor-pointer border px-3 py-2 rounded-md text-center transition flex flex-col items-center ${
              selectedType === type ? 'bg-black text-white' : 'bg-white text-black shadow-sm'
            }`}
          >
            <h2 className="text-sm font-semibold">{`${titleCase(type.toLowerCase())} Shoes`}</h2>
            <p className="text-[10px] mt-1">Explore {type.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Heading */}
      <div className="mt-2 mb-4">
        <h2 className="text-xl font-semibold text-center text-slate-900">
          {selectedType
            ? `${titleCase(selectedType.toLowerCase())} Shoes`
            : 'Top Selling Shoes'}
        </h2>
      </div>

      {/* Grid: 3 cols on mobile, expands on larger */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-label={`View ${product.name}`}
              className="group"
            >
              <div className="rounded-lg shadow-sm hover:shadow-md flex flex-col h-full cursor-pointer p-3 bg-white transition-transform duration-200 hover:scale-[1.02]">
                {/* Image */}
                <div className="w-full max-w-[160px] aspect-square rounded-lg overflow-hidden mb-2 mx-auto">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-center mb-1 overflow-hidden text-ellipsis text-black">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex justify-center mb-1">
                  {[...Array(5)].map((_, idx) => (
                    <span
                      key={idx}
                      className={`text-[12px] ${
                        product.rating > idx ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Price stuck to bottom */}
                <div className="flex justify-center items-center gap-2 text-sm mt-auto">
                  {product.mrpPrice && (
                    <p className="line-through text-gray-400">
                      ₹{product.mrpPrice.toFixed(0)}
                    </p>
                  )}
                  <p className="text-lg font-bold text-black">
                    ₹{product.price.toFixed(0)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center text-center h-48">
            <p className="text-center text-base text-black">No shoes found in this category.</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() =>
              setVisibleCount((v) => Math.min(v + (isMobileWidth() ? 9 : 25), filtered.length))
            }
            className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-yellow-500 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
