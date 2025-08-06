"use client";

import Link from "next/link";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  mrpPrice: number | null;
  price: number;
  rating: number | null;
  reviewCount?: number;
}

const Star = ({ filled }: { filled: "full" | "half" | "empty" }) => {
  if (filled === "full") return <FaStar className="text-xs sm:text-sm" />;
  if (filled === "half") return <FaStarHalfAlt className="text-xs sm:text-sm" />;
  return <FaRegStar className="text-xs sm:text-sm" />;
};

function renderStars(rating: number) {
  const avg = rating || 0;
  const fullStars = Math.floor(avg);
  const remainder = avg - fullStars;
  const hasHalf = remainder >= 0.25 && remainder < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} filled="full" />
      ))}
      {hasHalf && <Star filled="half" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} filled="empty" />
      ))}
    </>
  );
}

export default function MostSelling({ products }: { products: Product[] }) {
  return (
    <div className="bg-white pb-20 pt-4 px-4 sm:px-8">
      <h2 className="text-2xl font-semibold text-center text-slate-900 mb-10">
        Our Most Selling Products
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
        {products.length > 0 ? (
          products.map((product) => {
            const reviewCount = product.reviewCount ?? 0;
            const avgRating = product.rating ?? 0;
            const displayRating = reviewCount > 0 ? avgRating.toFixed(1) : null;
            const ratingLabel =
              reviewCount > 0
                ? `${displayRating} out of 5 stars · ${reviewCount} review${reviewCount > 1 ? "s" : ""}`
                : "No reviews yet";

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                aria-label={`View ${product.name} — ${ratingLabel}`}
                className="group"
              >
                <div className="w-full max-w-[220px] mx-auto rounded-lg shadow-md hover:shadow-lg flex flex-col items-center cursor-pointer p-4 transition bg-white">
                  <div className="aspect-square w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-center mb-1 text-black line-clamp-2 h-[3rem]">
                    {product.name}
                  </h3>
                  <div className="flex flex-col items-center mb-2">
                    <div
                      role="img"
                      aria-label={ratingLabel}
                      className={twMerge(
                        "flex items-center space-x-1 text-sm mb-1",
                        reviewCount > 0 ? "text-yellow-500" : "text-gray-300"
                      )}
                    >
                      {renderStars(avgRating)}
                    </div>
                    <div className="text-xs">
                      {reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          <span className="text-yellow-500">★</span>
                          <span>{displayRating}</span>
                          <span className="text-gray-500">
                            ({reviewCount} {reviewCount > 1 ? "reviews" : "review"})
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-500">No reviews yet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-3">
                    {product.mrpPrice && (
                      <p className="line-through text-gray-400 text-sm">
                        ₹{product.mrpPrice.toLocaleString("en-IN")}
                      </p>
                    )}
                    <p className="text-lg font-bold text-black">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="col-span-full text-center text-base text-black">
            No products available.
          </p>
        )}
      </div>
    </div>
  );
}
