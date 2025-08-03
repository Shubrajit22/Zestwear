'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      <div className="flex items-center bg-white rounded-full p-1 shadow-md h-12 overflow-hidden">
        <input
          type="text"
          placeholder="Search for Uniforms and More"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow min-w-0 px-4 text-black rounded-full outline-none"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center p-3 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick(product.id)}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={50}
                height={50}
                className="rounded object-cover mr-3"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{product.name}</p>
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
