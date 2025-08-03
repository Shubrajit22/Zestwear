'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};

export const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2 sm:px-4">
      {categories.map((cat) => {
        const categorySlug = cat.name.toLowerCase();
        return (
          <Link key={cat.id} href={`/categories/${categorySlug}`}>
            <div className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition duration-300 overflow-hidden">
              <div className="flex flex-col items-center p-3 sm:p-4">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={120}
                  height={120}
                  className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-cover rounded-md"
                />
                <div className="mt-3 text-center">
                  <h2 className="text-base sm:text-lg font-semibold capitalize text-gray-800">{cat.name}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
