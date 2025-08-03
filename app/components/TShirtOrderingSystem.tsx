'use client';

import { useSession } from 'next-auth/react';
import { useState, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TShirtOrderingSystem: React.FC = () => {

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession(); // ✅ good
   if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Please log in to place an order.</p>
      </div>
    );
  }
  
 const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>,
  type: 'front' | 'back'
) => {
  const file = e.target.files?.[0];
  if (file) {
    if (type === 'front') {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }
  }
};


  const handleSubmit = async () => {
    if (!frontImage || !backImage || !quantity || !address) {
      return toast.error('Please complete all fields.');
    }

    const formData = new FormData();
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);
    formData.append('quantity', quantity.toString());
    formData.append('address', address);

    setLoading(true);
    const res = await fetch('/api/send-order', {
      method: 'POST',
      body: formData,
    });

    setLoading(false);
    if (res.ok) {
      toast.success('Order placed successfully!');
      setFrontImage(null);
      setBackImage(null);
      setQuantity(1);
      setAddress('');
    } else {
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-gray-50 to-white py-12 px-6 sm:px-12">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-10 text-black"
      >
        Custom T-Shirt Order
      </motion.h1>

      {/* Image Upload Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
      >
        {[
          {
            label: 'Front Design',
            file: frontImage,
            id: 'front-upload',
            type: 'front',
          },
          {
            label: 'Back Design',
            file: backImage,
            id: 'back-upload',
            type: 'back',
          },
        ].map(({ label, file, id, type }) => (
          <motion.div
            key={id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-center"
          >
            <p className="text-lg font-semibold mb-2 text-black">{label}</p>
            {file ? (
              <Image
                src={URL.createObjectURL(file)}
                alt={label}
                width={220}
                height={220}
                className="rounded-lg object-cover mb-2"
              />
            ) : (
              <div className="w-56 h-56 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-black mb-2 text-sm">
                No Image Uploaded
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              id={id}
              onChange={(e) => handleImageChange(e, type as 'front' | 'back')}
              className="hidden"
            />
            <label
              htmlFor={id}
              className="cursor-pointer inline-block px-4 py-2 mt-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
            >
              Choose File
            </label>
          </motion.div>
        ))}
      </motion.div>

      {/* Quantity & Address Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl border border-gray-200 max-w-4xl mx-auto mt-10 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full border border-gray-300 text-black rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Delivery Address
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 text-black rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your full address"
          />
        </div>

        <div className="text-center pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 text-white font-medium rounded-lg transition-all hover:cursor-pointer hover:bg-yellow-500 ${
              loading
                ? 'bg-gray-900 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900'
            }`}
          >
            {loading ? 'Submitting...' : 'Place Order'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
export default TShirtOrderingSystem;