'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  order: number;
};

export const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        const data = await res.json();
        const sorted = [...data].sort((a, b) => a.order - b.order);
        setCategories(sorted);
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
      <div className="p-8 text-center text-gray-500">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-8 md:px-16">
    

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const categorySlug = cat.name.toLowerCase();
          return (
            <Link key={cat.id} href={`/categories/${categorySlug}`}>
  <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center p-4 h-full">
    {/* Image */}
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 flex-shrink-0">
      <Image
        src={cat.imageUrl}
        alt={cat.name}
        fill
        className="object-contain group-hover:scale-105 transition-transform duration-300"
      />
    </div>

    {/* Text wrapper to push description to bottom */}
    <div className="flex flex-col justify-between h-full w-full">
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 text-center">
        {cat.name}
      </h3>
      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
        {cat.description}
      </p>
    </div>
  </div>
</Link>

          );
        })}
      </div>
    </section>
  );
};
