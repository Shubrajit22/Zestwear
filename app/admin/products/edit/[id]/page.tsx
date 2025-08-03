'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

type SizeOption = {
  id?: string;
  size: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  mrpPrice: number;
  discount: number;
  imageUrl: string;
  type: string;
  categoryId: string;
  state?: string;
  district?: string;
  institution?: string;
  color?: string;
  texture?: string;
  neckline?: string;
  sizeOptions: SizeOption[];
  stockImages: { id?: string; imageUrl: string }[];
};

type Category = {
  id: string;
  name: string;
};

type EditableProductKey =
  | 'name'
  | 'description'
  | 'price'
  | 'mrpPrice'
  | 'discount'
  | 'type'
  | 'state'
  | 'district'
  | 'institution'
  | 'color'
  | 'texture'
  | 'neckline';

const editableFields: [label: string, key: EditableProductKey][] = [
  ['Name', 'name'],
  ['Description', 'description'],
  ['Price', 'price'],
  ['MRP Price', 'mrpPrice'],
  ['Discount', 'discount'],
  ['Type', 'type'],
  ['State', 'state'],
  ['District', 'district'],
  ['Institution', 'institution'],
  ['Color', 'color'],
  ['Texture', 'texture'],
  ['Neckline', 'neckline'],
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletedSizeOptionIds, setDeletedSizeOptionIds] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Cloudinary Config
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!;

  useEffect(() => {
    async function fetchData() {
      try {
        if (!id || typeof id !== 'string') return;

        const productRes = await fetch(`/api/admin/products/${id}`);
        if (!productRes.ok) throw new Error('Product not found');
        const productData = await productRes.json();
        setProduct(productData);

        const catRes = await fetch(`/api/admin/categories`);
        const categoryData = await catRes.json();
        setCategories(categoryData);
      } catch (e) {
        console.error(e);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleInput = <K extends keyof Product>(key: K, value: string) => {
    if (!product) return;
    const numberFields: (keyof Product)[] = ['price', 'mrpPrice', 'discount'];
    const parsedValue = numberFields.includes(key) ? parseFloat(value) || 0 : value;
    setProduct({ ...product, [key]: parsedValue as Product[K] });
  };

  const handleSizeChange = (index: number, field: keyof SizeOption, value: string | number) => {
    if (!product) return;
    const updatedSizes = [...product.sizeOptions];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: value,
    };
    setProduct({ ...product, sizeOptions: updatedSizes });
  };

  // Cloudinary Upload
  const handleCloudinaryUpload = async (file: File, target: 'main' | number) => {
    if (!file) return;
    setLoadingUpload(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const url = data.secure_url;

      if (product) {
        if (target === 'main') {
          setProduct({ ...product, imageUrl: url });
        } else {
          const updatedImages = [...product.stockImages];
          updatedImages[target].imageUrl = url;
          setProduct({ ...product, stockImages: updatedImages });
        }
      }

      toast.success('Image uploaded!');
    } catch {
  toast.error('Image upload failed');
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSubmit = async () => {
    if (!product) return;

    const newSizeOptions = product.sizeOptions.filter((s) => !s.id);
    const newStockImages = product.stockImages.filter((img) => !img.id);

    const payload = {
      ...product,
      newSizeOptions,
      deletedSizeOptionIds,
      newStockImages,
      deletedStockImageIds: deletedImageIds,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Update failed');
      toast.success('Product updated');
      router.push('/admin/products');
    }  catch {
  toast.error('Error Updating Product');
    }
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Loading product...</p>;
  if (error || !product)
    return <p className="text-red-500 text-center">{error || 'Product not found'}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-black mb-10 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Edit Product</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Editable Fields */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 gap-4">
            {editableFields.map(([label, key]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={product[key] ?? ''}
                  onChange={(e) => handleInput(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Image Upload */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Main Image</h2>
          {product.imageUrl && (
            <Image
                src={product.imageUrl}
                alt="Main"
                width={128}
                height={128}
                className="rounded object-cover mb-3"
              />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleCloudinaryUpload(e.target.files[0], 'main')}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Category */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Category</h2>
          <select
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={product.categoryId}
            onChange={(e) => handleInput('categoryId', e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Size Options */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Size Options</h2>
            <button
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              onClick={() =>
                setProduct((prev) =>
                  prev ? { ...prev, sizeOptions: [...prev.sizeOptions, { size: '', price: 0 }] } : prev
                )
              }
            >
              + Add Size
            </button>
          </div>

          {product.sizeOptions.map((s, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-2 items-center">
              <input
                placeholder="Size"
                value={s.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Price"
                  type="number"
                  value={s.price}
                  onChange={(e) => handleSizeChange(index, 'price', parseFloat(e.target.value))}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() =>
                    setProduct((prev) => {
                      if (!prev) return prev;
                      const sizeToDelete = prev.sizeOptions[index];
                      if (sizeToDelete.id) {
                        setDeletedSizeOptionIds((ids) => [...ids, sizeToDelete.id!]);
                      }
                      return {
                        ...prev,
                        sizeOptions: prev.sizeOptions.filter((_, i) => i !== index),
                      };
                    })
                  }
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stock Images with Upload */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Stock Images</h2>
            <button
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              onClick={() =>
                setProduct((prev) =>
                  prev ? { ...prev, stockImages: [...prev.stockImages, { imageUrl: '' }] } : prev
                )
              }
            >
              + Add Image
            </button>
          </div>

          {product.stockImages.map((img, index) => (
            <div key={index} className="flex items-center gap-2 mb-3">
              {img.imageUrl && (
                <Image
                    src={img.imageUrl}
                    alt="preview"
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />

              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleCloudinaryUpload(e.target.files[0], index)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() =>
                  setProduct((prev) => {
                    if (!prev) return prev;
                    const imageToDelete = prev.stockImages[index];
                    if (imageToDelete.id) {
                      setDeletedImageIds((ids) => [...ids, imageToDelete.id!]);
                    }
                    return {
                      ...prev,
                      stockImages: prev.stockImages.filter((_, i) => i !== index),
                    };
                  })
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
            disabled={loadingUpload}
          >
            {loadingUpload ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
