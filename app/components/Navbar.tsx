'use client';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserAlt } from 'react-icons/fa';
import { MdShoppingCart, MdMoreVert } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';
import SearchBarWithResults from './search';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCartCount = async () => {
      setLoadingCart(true);
      setCartError(null);
      if (session?.user) {
        try {
          const res = await fetch(`/api/cart?userId=${session.user.id}`);
          if (!res.ok) throw new Error('Failed to fetch cart data');
          const data = await res.json();
          setCartCount(data.cartItems.length);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCartError('Failed to load cart items');
        }
      } else {
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(Array.isArray(cartData) ? cartData.length : 0);
      }
      setLoadingCart(false);
    };
    fetchCartCount();
  }, [session]);

  const handleProfileClick = () => {
    setProfileOpen((o) => !o);
    setMenuOpen(false);
  };

  const handleSignInClick = () => {
    router.push('/login');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setProfileOpen(false);
  };

  // click outside handler
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isProfileOpen, isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-black text-white py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Left: Logo */}
      <Link href={'/'}>
        <div className="flex items-center space-x-4">
          <Image src="/home/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-md md:text-2xl font-bold">Zestwear India</h1>
        </div>
      </Link>

      {/* Desktop Search */}
      <div className="hidden md:flex flex-grow max-w-xs sm:max-w-md mx-6 bg-white rounded-full shadow-md p-1">
        <div className="w-full max-w-xl mx-auto">
          <SearchBarWithResults />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex space-x-6 text-lg flex-grow justify-between">
          <Link href="/" className="hover:text-yellow-400">
            Home
          </Link>
          <Link href="/contact" className="hover:text-yellow-400">
            Contact
          </Link>
          <Link href="/about" className="hover:text-yellow-400">
            About
          </Link>
          <div className="mr-6" />
        </div>

        {/* Avatar / Profile Icon */}
        <div className="relative" ref={profileRef}>
          {session?.user ? (
            session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full cursor-pointer border border-white"
                onClick={handleProfileClick}
                unoptimized
              />
            ) : (
              <FaUserAlt
                size={22}
                className="cursor-pointer hover:text-yellow-400"
                onClick={handleProfileClick}
              />
            )
          ) : (
            <FaUserAlt size={22} className="cursor-pointer hover:text-yellow-400" onClick={handleSignInClick} />
          )}

          {/* Profile dropdown */}
          {isProfileOpen && session?.user && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50" role="menu">
              <button
                className="w-full text-left px-4 py-2 hover:text-yellow-400"
                onClick={() => {
                  router.push('/profile');
                  setProfileOpen(false);
                }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:text-yellow-400"
                onClick={() => {
                  router.push('/orders');
                  setProfileOpen(false);
                }}
              >
                My Orders
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-200 text-red-500"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
          <MdShoppingCart size={26} className="hover:text-yellow-400" />
          {loadingCart ? (
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">...</span>
          ) : cartCount > 0 ? (
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
              {cartCount}
            </span>
          ) : cartError ? (
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
              Error
            </span>
          ) : null}
        </div>

        {/* Mobile Menu Icon */}
        <div ref={menuRef} className="relative">
          <MdMoreVert
            size={26}
            className="block md:hidden cursor-pointer hover:text-gray-400"
            onClick={() => {
              setMenuOpen((o) => !o);
              setProfileOpen(false);
            }}
          />

          {/* Mobile Menu */}
{isMenuOpen && (
  <div className="fixed top-16 inset-x-0 flex justify-center z-50 md:hidden">
    <div className="bg-black text-white p-4 rounded-lg shadow-lg border border-gray-600 w-[90vw] max-w-sm flex flex-col items-center ">
      <Link
        href="/"
        className="block py-2 hover:text-yellow-400 w-full"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/contact"
        className="block py-2 hover:text-yellow-400 w-full"
        onClick={() => setMenuOpen(false)}
      >
        Contact
      </Link>
      <Link
        href="/about"
        className="block py-2 hover:text-yellow-400 w-full"
        onClick={() => setMenuOpen(false)}
      >
        About
      </Link>

      <div className="mt-4 w-full flex justify-center">
        <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-inner w-full max-w-xs">
          <SearchBarWithResults />
        </div>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </nav>
  )}