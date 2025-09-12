'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { MdClose } from 'react-icons/md';
import { useCart } from './CartContextProvider';
import QRCode from "react-qr-code";

export interface CartItem {
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
  price: number;
  sizeId?: string | null;
}

interface SlidingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingCart = ({ isOpen, onClose }: SlidingCartProps) => {
  const { items: cartItems, clearCart, setCartItemsFromServer } = useCart() as {
    items: CartItem[];
    clearCart: () => void;
    setCartItemsFromServer: (items: CartItem[]) => void;
  };

  const [loadingCart, setLoadingCart] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [user, setUser] = useState<{ name: string; email: string; mobile: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const router = useRouter();
  const cartRef = useRef<HTMLDivElement>(null);

  const upiId = "upi";

  // Fetch user and cart when opened
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

  const fetchCartItems = async () => {
    setLoadingCart(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok && Array.isArray(data.cartItems)) {
        setCartItemsFromServer(data.cartItems);
      }
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen && !showPaymentConfirmation) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, showPaymentConfirmation]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, newQuantity }),
    });
    await fetchCartItems();
  };

  const handleRemoveItem = async (itemId: string) => {
    const response = await fetch(`/api/cart?cartItemId=${itemId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await fetchCartItems();
    }
  };

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

  const handleBhimPayment = async () => {
    if (!selectedAddress.trim()) {
      toast.error("Please enter a shipping address.");
      return;
    }

    const amount = calculateTotal();
    
    // Store order data for later use
    const orderPayload = {
      email: user?.email,
      amount,
      address: selectedAddress,
      items: cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price:
          item.price ??
          item.product.sizeOptions.find((s) => s.size === item.size)?.price ??
          item.product.price ??
          0,
        size: item.size,
        productId: item.product.id,
        sizeId: item.sizeId || null,
      })),
    };

    setPendingOrderData(orderPayload);
    
    // Create UPI payment link
    const upiLink = `upi://pay?pa=${upiId}&pn=Zestware&am=${amount}&cu=INR&tn=Order%20Payment`;
    
    // Show payment confirmation modal
    setShowPaymentConfirmation(true);
    
    // Open UPI app
    window.location.href = upiLink;
  };

  const handlePaymentSuccess = async () => {
    if (!upiTransactionId.trim()) {
      toast.error("Please enter the UPI transaction ID");
      return;
    }

    setProcessingPayment(true);
    
    try {
      const orderPayloadWithUpi = {
        ...pendingOrderData,
        upiTransactionId: upiTransactionId,
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayloadWithUpi),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart after successful order
        clearCart();
        await fetchCartItems();
        
        toast.success("Order placed successfully!");
        
        // Reset states
        setShowPaymentConfirmation(false);
        setUpiTransactionId('');
        setPendingOrderData(null);
        setProcessingPayment(false);
        
        // Close cart and navigate to orders
        onClose();
        router.push('/orders');
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error("Failed to place order. Please try again.");
      setProcessingPayment(false);
    }
  };

   const handlePaymentCancel = () => {
    setShowPaymentConfirmation(false);
    setUpiTransactionId('');
    setPendingOrderData(null);
    toast("Payment cancelled. Your cart items are saved.");
  };

  if (showPaymentConfirmation) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Payment Confirmation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please complete the payment in your UPI app and enter the transaction ID below to confirm your order.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI Transaction ID / Reference Number
            </label>
            <input
              type="text"
              value={upiTransactionId}
              onChange={(e) => setUpiTransactionId(e.target.value)}
              placeholder="Enter UPI transaction ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can find this in your UPI app under transaction history
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePaymentSuccess}
              disabled={!upiTransactionId.trim() || processingPayment}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                upiTransactionId.trim() && !processingPayment
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {processingPayment ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button
              onClick={handlePaymentCancel}
              disabled={processingPayment}
              className="flex-1 py-2 px-4 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div ref={cartRef} className={`absolute top-0 right-0 h-full w-[90%] sm:w-[400px] max-w-full bg-white text-black shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Your Cart</h2>
          <div className="flex items-center gap-3">
            {cartItems.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/cart', { method: 'DELETE' });
                    if (res.ok) {
                      clearCart();
                      await fetchCartItems();
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

        <div className="p-4 space-y-4">
          {loadingCart ? (
            <p className="text-center">Loading...</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="relative flex gap-3 sm:gap-4 border-b pb-4">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 text-sm">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove"
                    >
                      <MdClose size={18} />
                    </button>

                    <h3 className="font-semibold text-base">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.product.description}</p>

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
              <p className="text-xs text-gray-500 mt-1">Please enter your full address to enable payment.</p>

              {/* Show UPI QR + Link */}
              {selectedAddress.trim() && (
                <div className="mt-6 flex flex-col items-center">
                  <QRCode
                    value={`upi://pay?pa=${upiId}&pn=Zestware&am=${calculateTotal()}&cu=INR&tn=Order%20Payment`}
                    size={180}
                  />
                  <p className="mt-2 text-xs text-gray-600">Scan QR with BHIM / UPI app</p>
                </div>
              )}

              <button
                onClick={handleBhimPayment}
                disabled={!selectedAddress.trim()}
                className={`w-full mt-4 py-3 rounded transition-colors ${
                  selectedAddress.trim()
                    ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Pay Now via BHIM UPI – ₹{(calculateTotal() || 0).toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidingCart;