"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "../../components/CartContextProvider";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import type { Prisma,Product } from "@prisma/client";
import SlidingCart from "@/app/components/Slidingcart";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";


// Product with stockImages + sizeOptions
export type ProductWithExtras = Prisma.ProductGetPayload<{
  include: {
    stockImages: true;
    sizeOptions: true;
  };
}>;

// Related products (basic shape)
export type RelatedProduct = Product;

// Review with user included
export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: { select: { name: true; image: true } };
  };
}>;

export default function ProductPageContent({
  product,
  relatedProducts,
  reviews: initialReviews,
}: {
  product: ProductWithExtras;
  relatedProducts: RelatedProduct[];
  reviews: ReviewWithUser[];
}) {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewWithUser[]>(initialReviews || []);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [errorFetchingReviews, setErrorFetchingReviews] = useState("");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);

  const fallbackImage = "/images/fallback-image.jpg";
const renderStars = (rating: number | null) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (!rating || rating < i - 0.5) {
      stars.push(<FaRegStar key={i} className="text-gray-300 text-sm" />);
    } else if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-sm" />);
    } else {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-sm" />);
    }
  }
  return stars;
};

  // derive average rating from the reviews
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;
  const roundedAvg = averageRating ? Math.round(averageRating * 10) / 10 : null;

  const getValidImage = (src: string | undefined | null): string => {
    if (typeof src === "string" && src.trim().startsWith("http")) {
      return src;
    }
    return fallbackImage;
  };

  const allImages =
    product.stockImages.length > 0
      ? product.stockImages.map((img) => getValidImage(img.imageUrl))
      : [getValidImage(product.imageUrl)];

  const [mainImage, setMainImage] = useState<string>(
    getValidImage(product.imageUrl)
  );
  const [stockImages, setStockImages] = useState<string[]>(
    allImages.filter((img) => img !== getValidImage(product.imageUrl))
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const selectedSizeOption = product.sizeOptions?.find(
    (opt) => opt.size === selectedSize
  );
  const displayedPrice = selectedSizeOption?.price ?? product.price;

  const handleImageChange = (clickedImage: string) => {
    setMainImage(clickedImage);
    setStockImages((prev) => [
      mainImage,
      ...prev.filter((img) => img !== clickedImage),
    ]);
  };

const handleAddToCart = async () => {
  if (!selectedSizeOption) {
    toast.error("Please select a size!");
    return;
  }

  const newItem = {
    id: `temp-${Date.now()}`,
    product: {
      id: product.id,
      name: product.name,
      price: selectedSizeOption.price,
      imageUrl: mainImage,
      description: product.description,
      sizeOptions: product.sizeOptions,
    },
    quantity: 1,
    size: selectedSizeOption.size,
    sizeId: selectedSizeOption.id,
  };

  addToCart(newItem); // Automatically opens the cart
  toast.success("Added to cart!");
  

  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        size: selectedSizeOption.size,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Failed to add to cart");
    }
  } catch (error) {
    toast.error("An error occurred while syncing cart.");
    console.error("Cart sync error:", error);
  }
  setIsCartOpen(true);
};


  // only compare categoryId, not category (since Prisma Product has categoryId)
  const relatedCategoryProducts = relatedProducts.filter(
    (rp) => rp.categoryId === product.categoryId
  );

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
      return;
    }

    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const response = await fetch(`/api/products/${product.id}/reviews`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setErrorFetchingReviews("Failed to fetch reviews.");
        toast.error("Failed to load reviews");
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id, initialReviews]);

  const handleReviewSubmit = async () => {
    if (!newReview || newRating === 0) {
      toast.error("Please provide both a comment and a rating.");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to leave a review.");
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: newReview,
          rating: newRating,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) => [data, ...prev]);
        setNewReview("");
        setNewRating(0);
        toast.success("Review submitted!");
      } else {
        toast.error(data.message || "Error submitting review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    }
  };
return (
  <div className="bg-white-gradient min-h-screen flex flex-col items-center justify-center pt-16 px-4 sm:px-6 md:px-10 pb-10 text-black ">
    {/* Product Section */}
    <div className="flex flex-col md:flex-row w-full gap-8 mt-20">
      {/* Left: Image */}
      <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
        <div className="w-full sm:w-[300px] md:w-[400px] h-[300px] sm:h-[300px] md:h-[400px] border-2 border-black p-2 rounded-md flex items-center justify-center">
          <Image
            src={getValidImage(mainImage)}
            alt={product.name || 'Product Image'}
            width={400}
            height={400}
            className="rounded object-cover w-full h-full"
          />

        </div>

        {/* Thumbnails */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {stockImages.map((thumb, index) => (
            <button key={index} onClick={() => handleImageChange(thumb)}>
              <div className="w-[70px] h-[70px] border rounded-md overflow-hidden">
                <Image
                  src={getValidImage(thumb)}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
<div className="w-full md:w-1/2 flex flex-col gap-6">
  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{product.name}</h1>

  <div className="flex items-center gap-4 flex-wrap">
  {/* Rating summary from reviews */}
  <div className="flex items-center gap-2">
    <div className="flex">
      {renderStars(averageRating)}

    </div>
    {roundedAvg !== null ? (
      <span className="text-sm text-gray-500 ml-2">
        {roundedAvg} ({reviewCount} review{reviewCount > 1 ? 's' : ''})
      </span>
    ) : (
      <span className="text-sm text-gray-500 ml-2">No reviews yet</span>
    )}
  </div>

  {/* Optional badge */}
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
    Best Seller
  </div>
</div>


  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{product.description}</p>

  {/* Pricing */}
  <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 gap-2">
    <div className="flex items-baseline gap-3">
      {product.mrpPrice && displayedPrice && product.mrpPrice > displayedPrice ? (
        <>
          <p className="text-lg sm:text-xl font-medium line-through text-gray-400">
            ₹{product.mrpPrice.toFixed(0)}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-black">
              ₹{displayedPrice.toFixed(0)}
            </p>
            <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
              {Math.round(((product.mrpPrice - displayedPrice) / product.mrpPrice) * 100)}% OFF
            </span>
          </div>
        </>
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-black">
          ₹{displayedPrice.toFixed(0)}
        </p>
      )}
    </div>
    {product.mrpPrice && displayedPrice && product.mrpPrice > displayedPrice && (
      <div className="text-sm text-green-600">
        You save ₹{(product.mrpPrice - displayedPrice).toFixed(0)}
      </div>
    )}
  </div>

  {/* Size selection */}
  <div className="space-y-2">
    <label className="font-semibold block text-sm sm:text-base">Size:</label>
    <div className="flex flex-wrap gap-2">
      {product.sizeOptions.length > 0 ? (
        product.sizeOptions.map((opt) => (
          <button
            key={opt.size}
            onClick={() => setSelectedSize(opt.size)}
            className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              selectedSize === opt.size
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black`}
            aria-pressed={selectedSize === opt.size}
          >
            {opt.size}
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-500">No sizes available</p>
      )}
    </div>
  </div>

  {/* Add to Cart button */}
  <div className="mt-6">
    <button
      onClick={handleAddToCart}
      disabled={!selectedSize}
      className={`w-full flex justify-center px-6 py-3 rounded-md text-base font-semibold transition hover:cursor-pointer ${
        !selectedSize
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:opacity-95 hover:bg-yellow-500'
      }`}
    >
      Add to Cart
    </button>
    <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />


  </div>

  {/* Trust / secondary info */}
  <div className="text-sm text-gray-500 mt-2 space-y-1">
    <p>Free shipping on orders above ₹999.</p>
    <p>30-day hassle-free returns.</p>
  </div>
</div>

    </div>

    {/* Related Products */}
    <div className="w-full py-8 px-4 sm:px-6 md:px-10 bg-gray-100 mt-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedCategoryProducts.length > 0 ? (
          relatedCategoryProducts.map((relatedProduct) => (
            <Link
              key={relatedProduct.id}
              href={`/product/${relatedProduct.id}`}
              className="w-full bg-white rounded-md shadow-lg p-4"
            >
              <Image
  src={getValidImage(relatedProduct.imageUrl)}
  alt={relatedProduct.name}
  width={250}
  height={250}
  className="object-cover w-full h-60 rounded-md"
/>

              <h3 className="font-semibold text-base sm:text-lg mt-2">{relatedProduct.name}</h3>
              <p className="text-gray-600 text-sm mt-1">₹ {relatedProduct.price}</p>
            </Link>
          ))
        ) : (
          <p className="text-center col-span-4">No related products found.</p>
        )}
      </div>
    </div>

    {/* Reviews Section */}
<div className="w-full py-8 mt-10 px-4 sm:px-6 md:px-10">
  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Customer Reviews</h2>

  {/* Review Form (first) */}
  <div className="max-w-3xl mx-auto mb-8 bg-white shadow-lg rounded-lg p-6">
    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
      Leave a Review
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Share your experience with this product. Your feedback helps others shop confidently.
    </p>

    {session?.user ? (
      <>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Rating</label>
            <div className="flex gap-1">
              {Array(5)
                .fill(0)
                .map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewRating(idx + 1)}
                    className="text-2xl cursor-pointer transition"
                    aria-label={`${idx + 1} star`}
                  >
                    {newRating >= idx + 1 ? (
                      <FaStar className="text-yellow-500" />
                    ) : (
                      <FaRegStar className="text-gray-300" />
                    )}
                  </button>
                ))}

            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Review</label>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Write your review here..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleReviewSubmit}
              className="bg-black text-white py-2 px-6 rounded-md font-semibold shadow hover:brightness-110 transition"
            >
              Submit Review
            </button>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center text-lg text-gray-600">
        <p>You must be logged in to submit a review</p>
      </div>
    )}
  </div>

  {/* Summary */}
  <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
    <div className="flex items-center gap-3">
      <div className="flex">
        {renderStars(averageRating)}

      </div>
      <div className="flex flex-col">
        {roundedAvg !== null ? (
          <>
            <div className="text-lg font-semibold">
              {roundedAvg} <span className="text-sm font-normal">/ 5</span>
            </div>
            <div className="text-sm text-gray-500">
              {reviewCount} review{reviewCount > 1 ? 's' : ''}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">No reviews yet</div>
        )}
      </div>
    </div>
    {roundedAvg !== null && (
      <div className="ml-auto text-sm text-gray-600">
        {/* Optional: breakdown placeholder */}
        {/* Could add bars for 5★,4★ etc. here */}
      </div>
    )}
  </div>

  {/* Loading / error */}
  {isLoadingReviews ? (
    <div className="text-center text-lg sm:text-xl">Loading reviews...</div>
  ) : errorFetchingReviews ? (
    <div className="text-center text-xl text-red-600">{errorFetchingReviews}</div>
  ) : reviews.length > 0 ? (
    <div className="max-w-3xl mx-auto space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-3"
        >
          <div className="flex items-center gap-4">
            <Image
              src={review.user?.image || '/images/fallback-user.png'}
              alt={review.user?.name || 'User Avatar'}
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}

                  <span className="text-xs text-gray-500 ml-2">{review.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-lg">No reviews yet. Be the first to review!</div>
  )}
</div>

  </div>
);
}