'use client';
export const dynamic = 'force-dynamic';
import { createContext, useContext, useState, useEffect } from 'react';

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
  price: number; // ✅ Add this line
  sizeId?: string | null;
}


interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  cartCount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, sizeId: string) => void;
  clearCart: () => void;
  setCartItemsFromServer: (items: CartItem[]) => void;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  // Add this function inside the context for external components to refresh cart
const setCartItemsFromServer = (newItems: CartItem[]) => {
  setItems(newItems);
};

const addToCart = async (newItem: CartItem): Promise<boolean> => {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (!res.ok || !data.user) {
      window.location.href = "/login";
      return false; 
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === newItem.product.id && item.sizeId === newItem.sizeId
      );
      let updatedItems;
      if (existingIndex >= 0) {
        updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += newItem.quantity;
      } else {
        updatedItems = [...prevItems, newItem];
      }
      return updatedItems;
    });

    openCart();
    return true; // ✅ Successfully added
  } catch (error) {
    console.error("Error checking user login:", error);
    window.location.href = "/login";
    return false;
  }
};

  const removeFromCart = (productId: string, sizeId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId || item.sizeId !== sizeId)
    );
  };

  // ✅ Clear cart both in state and localStorage
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
  value={{
    items,
    isOpen,
    cartCount,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    clearCart,
    setCartItemsFromServer, // expose it
  }}
>

      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartContextProvider');
  return context;
};
