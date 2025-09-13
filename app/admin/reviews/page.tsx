'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    image: string;
  };
  product: {
    name: string;
  };
}

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const router = useRouter();

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (!res.ok) throw new Error('Not authorized');
      const data = await res.json();
      if (data.isAdmin) {
        setIsAuthorized(true);
        fetchReviews();
      } else {
        setIsAuthorized(false);
        router.replace('/unauthorized'); // or login page
      }
    } catch (err) {
      setIsAuthorized(false);
      router.replace('/unauthorized');
    }
  };

  const fetchReviews = async () => {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  const deleteReview = async (id: string) => {
    setDeletingId(id);
    const toastId = toast.loading('Deleting review...');
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted successfully!', { id: toastId });
    } else {
      toast.error('Failed to delete review.', { id: toastId });
    }

    setDeletingId(null);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  if (isAuthorized === null) {
    return <div className="p-6 text-center">Checking permissions...</div>;
  }

  if (loading) {
    return <div className="p-6 text-center">Loading reviews...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">🛠️ Admin Review Panel</h1>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews found.</p>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-lg shadow-md bg-white border border-gray-200 transition hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg text-gray-900">{review.user?.name}</p>
                  <p className="text-sm text-gray-500">Product: {review.product.name}</p>
                </div>
                <button
                  disabled={deletingId === review.id}
                  onClick={() => deleteReview(review.id)}
                  className={`text-sm px-3 py-1 rounded-md transition ${
                    deletingId === review.id
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {deletingId === review.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <span
                      key={idx}
                      className={`text-lg ${
                        review.rating > idx ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
