'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { MdClose } from 'react-icons/md';
import { useCart } from './CartContextProvider';

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
  price: number; // Price saved when item added to cart
  sizeId?: string | null;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
}

interface SlidingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingCart = ({ isOpen, onClose }: SlidingCartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; mobile: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const router = useRouter();
  const cartRef = useRef<HTMLDivElement>(null);
  const { clearCart } = useCart();

  // Fetch user and cart when cart opens
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
          await fetchCartItems();
        } else {
          toast.error('Please log in to view cart');
        }
      } catch {
        toast.error('Please log in to view cart');
      }
    };

    if (isOpen) {
      fetchUserAndCart();
    }
  }, [isOpen]);

  // Fetch cart items
  const fetchCartItems = async () => {
    setLoadingCart(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok && Array.isArray(data.cartItems)) {
        setCartItems(data.cartItems);
      }
    } finally {
      setLoadingCart(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Close cart when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Update quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, newQuantity }),
    });
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    const response = await fetch(`/api/cart?cartItemId=${itemId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  // Calculate total price using CartItem.price
const calculateTotal = () => {
  return cartItems.reduce((total, item) => {
    const price =
      item.price ??
      item.product.sizeOptions.find((s) => s.size === item.size)?.price ??
      item.product.price ??
      0;
    return total + price * item.quantity;
  }, 0);
};



  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address.');
      return;
    }

    setProcessingPayment(true); // Show loader immediately

    const orderPayload = {
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_order_id: response.razorpay_order_id,
  email: user?.email,
  name: user?.name,
  amount: calculateTotal(),
  address: selectedAddress,
  items: cartItems.map((item) => {
    const finalPrice =
      item.price ??
      item.product.sizeOptions.find((s) => s.size === item.size)?.price ??
      item.product.price ??
      0;

    return {
      name: item.product.name,
      quantity: item.quantity,
      price: finalPrice,
      size: item.size,
      productId: item.product.id,
      sizeId: item.sizeId || null,
    };
  }),
};


    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        clearCart(); // Clear context state
        setCartItems([]); // Clear local state

        // Wait briefly so loader is visible
        setTimeout(() => {
          setProcessingPayment(false);
          onClose(); // Close the cart UI
          router.push('/orders');
        }, 1500);
      } else {
        toast.error('Order failed.');
        setProcessingPayment(false);
      }
    } catch {
      toast.error('Something went wrong.');
      setProcessingPayment(false);
    }
  };

  // Start Razorpay payment
  const handleRazorpayPayment = async () => {
    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: calculateTotal() }),
    });
    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: 'INR',
      name: 'ZESTWARE',
      description: 'Order Payment',
      image: '/home/logo.png',
      order_id: data.id,
      handler: handlePaymentSuccess,
      prefill: {
        name: user?.name || 'Customer',
        email: user?.email || '',
        contact: user?.mobile || '',
      },
      theme: { color: '#000' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* Sliding panel */}
      <div
        ref={cartRef}
        className={`absolute top-0 right-0 h-full w-[90%] sm:w-[400px] max-w-full bg-white text-black shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Your Cart</h2>
          <div className="flex items-center gap-3">
            {cartItems.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/cart', { method: 'DELETE' });
                    if (res.ok) {
                      clearCart(); // clears local context
                      setCartItems([]); // clears local state
                      toast.success('Cart cleared successfully.');
                    } else {
                      toast.error('Failed to clear cart.');
                    }
                  } catch {
                    toast.error('Failed to clear cart.');
                  }
                }}
                className="hover:cursor-pointer px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300"
              >
                Clear Cart
              </button>
            )}
            <button onClick={onClose} className='cursor-pointer'>
              <MdClose size={24} />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="p-4 space-y-4">
          {loadingCart ? (
            <p className="text-center">Loading...</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="relative flex gap-3 sm:gap-4 border-b pb-4">
                  {/* Product Image */}
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />

                  {/* Product Details */}
                  <div className="flex-1 text-sm">
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove"
                    >
                      <MdClose size={18} />
                    </button>

                    <h3 className="font-semibold text-base">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.product.description}</p>

                    {/* Size, Price, Quantity */}
                    <div className="flex flex-wrap items-center justify-between mt-2 text-xs gap-y-1">
                      <p>Size: <span className="font-medium">{item.size}</span></p>
                      <p>
  Price: 
  <span className="font-medium">
    ₹{(
      item.price ??
      item.product.sizeOptions.find((s) => s.size === item.size)?.price ??
      item.product.price ??
      0
    ).toFixed(2)}
  </span>
</p>


                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Price */}
              <div className="mt-4">
                <h3 className="font-semibold text-lg">
                  Total: ₹{(calculateTotal() || 0).toFixed(2)}
                </h3>
              </div>

              <textarea
                className="w-full mt-4 p-2 border border-gray-300 rounded text-sm"
                placeholder="Shipping address..."
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Please enter your full address to enable payment.
              </p>


              <button
  onClick={handleRazorpayPayment}
  disabled={!selectedAddress.trim()} // disable when no address
  className={`w-full mt-4 py-3 rounded transition-colors ${
    selectedAddress.trim()
      ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Pay Now – ₹{(calculateTotal() || 0).toFixed(2)}
</button>

            </>
          )}
        </div>
      </div>

      {/* Processing Payment Overlay */}
      {processingPayment && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-gray-400 animate-spin-slow"></div>
          </div>

          <p className="mt-6 text-white text-lg font-semibold tracking-wide">Processing your order...</p>
          <p className="mt-1 text-gray-300 text-sm">Please wait, redirecting to your orders</p>
        </div>
      )}
    </div>
  );
};

export default SlidingCart;
