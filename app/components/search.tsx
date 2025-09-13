'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

const SearchBarWithResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch search results
  useEffect(() => {
    if (query.trim()) {
      const delayDebounce = setTimeout(() => {
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data);
            setShowDropdown(true);
          });
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else {
      setShowDropdown(false);
      setResults([]);
    }
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (id: string) => {
    router.push(`/product/${id}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Rectangular search input with FaSearch */}
      <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm h-12 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
        <FaSearch className="ml-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search for Uniforms and More"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow px-3 text-gray-900 text-sm outline-none"
        />
      </div>

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md max-h-80 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => handleClick(product.id)}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={50}
                height={50}
                className="rounded-sm object-cover mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBarWithResults;
