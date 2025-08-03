'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    sizeOptions: {
      id: string;
      size: string;
      price: number;
    }[];
  };
  quantity: number;
  size: string;
  sizeId?: string | null;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string; mobile: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          toast.error('User not logged in');
        }
      } catch {
        toast.error('Could not get user info');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        if (response.ok && Array.isArray(data.cartItems)) {
          setCartItems(data.cartItems);
        } else {
          toast.error(data.message || 'Error fetching cart items');
        }
      } catch {
        toast.error('An error occurred while fetching cart items');
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setLoading(true);
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, newQuantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Error updating cart');
      } else {
        toast.success('Cart updated successfully');
      }
    } catch {
      toast.error('An error occurred while updating cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart?cartItemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success('Item removed from cart');
      } else {
        toast.error(data.message || 'Error removing item');
      }
    } catch {
      toast.error('An error occurred while removing item');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      if (!selectedAddress) {
        toast.error('Please select a shipping address.');
        return;
      }

      const orderPayload = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        email: user?.email,
        name: user?.name,
        amount: calculateTotal(),
        address: selectedAddress,
        items: cartItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          productId: item.product.id,
          sizeId: item.sizeId || null,
        })),
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Order placed successfully!');
        router.push('/orders');
      } else {
        toast.error(data.message || '❌ Order failed.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const handleRazorpayPayment = async () => {
    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: calculateTotal() }),
    });

    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: 'INR',
      name: 'ZESTWARE',
      description: 'Order Payment',
      image: '/logo.png',
      order_id: data.id,
      handler: function (response: RazorpayResponse) {
        handlePaymentSuccess(response);
      },
      prefill: {
        name: user?.name || 'Customer',
        email: user?.email || '',
        contact: user?.mobile || '',
      },
      theme: {
        color: '#000',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

return (
  <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 md:px-10 py-10 mt-10">
    <h1 className="text-5xl font-extrabold text-center mb-10  mt-10">
      Your Shopping Cart
    </h1>

    {loading ? (
      <div className="text-center text-2xl animate-pulse">Loading...</div>
    ) : (
      <div className="space-y-10 max-w-7xl mx-auto">
        {cartItems.length === 0 ? (
          <p className="text-center text-lg text-gray-400">
            Your cart is empty.
          </p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between bg-white/10 rounded-2xl shadow-xl p-6 gap-8 hover:shadow-2xl transition duration-300"
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-40 h-40">
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-xl border-2 border-gray-300"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold">{item.product.name}</h2>
                <p className="text-gray-300 text-sm line-clamp-2">{item.product.description}</p>
                <p className="text-lg">Size: <span className="font-semibold">{item.size}</span></p>
                <p className="text-2xl font-semibold ">
                  ₹{item.product.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity & Remove */}
              <div className="flex flex-col items-center md:items-end space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-10 h-10 bg-gray-700 text-white rounded-full hover:bg-yellow-500 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-xl font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-10 h-10 bg-gray-700 text-white rounded-full hover:bg-yellow-500"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                >
                  <Image src="/images/remove.png" alt="remove" width={25} height={25} />
                  <span className="text-sm">Remove</span>
                </button>
              </div>
            </div>
          ))
        )}

        {cartItems.length > 0 && (
          <>
            {/* Total */}
            <div className="flex justify-end items-center text-2xl font-bold">
              <h3 className="pr-4">Total:</h3>
              <span className=" text-white rounded-xl px-4 py-2">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>

            {/* Payment Section */}
            <div className="bg-white/5 rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-semibold">Proceed to Payment</h2>
              <div>
                <label className="block text-lg mb-2">Please Enter Your Shipping Address Before Payment</label>
                <textarea
                  className="w-full p-4 rounded-lg text-white border border-white bg-transparent focus:outline-none focus:border-gray-300"
                  rows={3}
                  placeholder="Enter your shipping address..."
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                />

              </div>
              <button
                onClick={handleRazorpayPayment}
                className="hover:cursor-pointer w-full py-4 text-xl font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:scale-105 hover:from-blue-500 hover:to-indigo-600 transition duration-300 text-white shadow-xl"
              >
                Pay Now – ₹{calculateTotal().toFixed(2)}
              </button>
            </div>
          </>
        )}
      </div>
    )}
  </div>
);
}

export default CartPage;
