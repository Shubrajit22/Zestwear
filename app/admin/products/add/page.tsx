'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

type Category = {
  id: string;
  name: string;
};

type SizeOption = {
  size: string;
  price: string;
};

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    description: '',
    price: '',
    mrpPrice: '',
    discount: '',
    imageUrl: '',
    categoryId: '',
    type: '',
    state: '',
    district: '',
    institution: '',
    color: '',
    texture: '',
    neckline: '',
  });

  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);
  const [stockImages, setStockImages] = useState<string[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Cloudinary config
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        toast.error('Failed to load categories');
        console.log(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index: number, key: keyof SizeOption, value: string) => {
    const updated = [...sizeOptions];
    updated[index][key] = value;
    setSizeOptions(updated);
  };

  const addSizeOption = () => setSizeOptions([...sizeOptions, { size: '', price: '' }]);
  const removeSizeOption = (i: number) =>
    setSizeOptions(sizeOptions.filter((_, index) => index !== i));

  // Cloudinary upload
  const handleCloudinaryUpload = async (file: File, index?: number) => {
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

      if (index !== undefined) {
        const updated = [...stockImages];
        updated[index] = url;
        setStockImages(updated);
      } else {
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }

      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image');
      console.log(err);
    } finally {
      setLoadingUpload(false);
    }
  };

  const addStockImage = () => setStockImages([...stockImages, '']);
  const removeStockImage = (i: number) =>
    setStockImages(stockImages.filter((_, index) => index !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        mrpPrice: parseFloat(form.mrpPrice),
        discount: parseFloat(form.discount),
        sizeOptions: sizeOptions.map((s) => ({
          size: s.size,
          price: parseFloat(s.price),
        })),
        stockImages,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add product');

      toast.success('Product added successfully!');
      router.push('/admin/products');
    } catch (err) {
      toast.error('Could not submit product');
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white text-black max-w-4xl mx-auto mb-10 mt-10 rounded-lg mt-20">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {/* Basic Fields */}
        {['name', 'description', 'price', 'mrpPrice', 'discount', 'state', 'district', 'institution', 'color', 'texture', 'neckline'].map(
          (field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field}
              required={['name', 'price', 'mrpPrice', 'discount'].includes(field)}
              className="p-2 border rounded"
            />
          )
        )}

        {/* Main Image Upload */}
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Main Image:</p>
          {form.imageUrl && (
            <Image src={form.imageUrl} alt="preview" width={100} height={100} className="rounded" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleCloudinaryUpload(e.target.files[0])}
          />
        </div>

        {/* Category */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Product Type */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        >
          <option value="">Select Type</option>
          {['HOODIE', 'TSHIRT', 'UNIFORM', 'JERSEY', 'SPORTS', 'CASUAL', 'FORMAL'].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Stock Images Upload */}
        <div>
          <p className="font-semibold">Stock Images:</p>
          {stockImages.map((img, index) => (
            <div key={index} className="flex gap-2 my-1 items-center">
              {img && img.startsWith('http') && (
                <Image src={img} alt="preview" width={48} height={48} className="rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleCloudinaryUpload(e.target.files[0], index)}
              />
              <button
                type="button"
                onClick={() => removeStockImage(index)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStockImage}
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
          >
            + Add Image
          </button>
        </div>

        {/* Size Options */}
        <div>
          <p className="font-semibold">Size Options:</p>
          {sizeOptions.map((option, index) => (
            <div key={index} className="flex gap-2 my-1">
              <input
                value={option.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                placeholder="Size"
                className="p-2 border rounded"
              />
              <input
                value={option.price}
                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                placeholder="Price"
                className="p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeSizeOption(index)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeOption}
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
          >
            + Add Size
          </button>
        </div>

        <button
          type="submit"
          disabled={loadingUpload}
          className="mt-4 p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loadingUpload ? 'Uploading...' : 'Submit Product'}
        </button>
      </form>
    </div>
  );
}
