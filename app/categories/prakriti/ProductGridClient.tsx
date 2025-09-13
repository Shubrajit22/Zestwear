'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ProductType = 'TSHIRT' | 'HOODIE';

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

const isMobileWidth = () => typeof window !== 'undefined' && window.innerWidth < 768;

export default function ProductGridClient({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(() => (isMobileWidth() ? 9 : 25));

  // Adjust count on window resize
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

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="min-h-screen px-3 sm:px-6">
      

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

      {/* Load more button */}
      {visibleCount < products.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() =>
              setVisibleCount((v) => Math.min(v + (isMobileWidth() ? 9 : 25), products.length))
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
