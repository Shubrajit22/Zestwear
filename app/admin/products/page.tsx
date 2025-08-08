'use client';

import { useEffect, useState,useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stockImages?: { imageUrl: string }[];
  type?: string;
  category?: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const loadingToastRef = useRef<string | null>(null);


useEffect(() => {
  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError('');

    // Show loading toast only once
    if (!loadingToastRef.current) {
      loadingToastRef.current = toast.loading('Loading products...');
    }

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);

      if (!productsRes.ok) throw new Error('Failed to fetch products');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

      const productsData: Product[] = await productsRes.json();
      const categoriesData: Category[] = await categoriesRes.json();

      setProducts(productsData.sort((a, b) => a.name.localeCompare(b.name)));
      setCategories(categoriesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching data:', message);
      setError(message);
      toast.error(message);
    } finally {
      // Dismiss the loader only if it was shown
      if (loadingToastRef.current) {
        toast.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }
      setLoading(false);
    }
  };

  fetchProductsAndCategories();
}, []);


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Delete failed');

      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product');
      toast.error('Failed to delete product');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value || null);
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category?.id === selectedCategory)
    : products;

  if (loading) {
    return <p className="text-center text-gray-600">Loading products and categories...</p>;
  }

  return (
    <div className="p-4 bg-white text-black min-h-screen mt-20">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={() => router.push('/admin/products/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="mr-2 font-medium">
          Filter by Category:
        </label>
        <select
          id="category"
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          className="border rounded p-2"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => {
            const imageSrc =
              product.imageUrl ||
              product.stockImages?.[0]?.imageUrl ||
              '/placeholder.jpg';

            return (
              <div
                key={product.id}
                className="border rounded p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition"
              >
                {imageSrc.startsWith('http') ? (
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    width={96}
                    height={96}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-sm text-gray-600">
                    ₹{product.price} {product.type && `• ${product.type}`}
                  </p>
                  {product.category?.name && (
                    <p className="text-xs text-gray-500">Category: {product.category.name}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
