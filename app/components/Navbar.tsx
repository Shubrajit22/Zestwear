'use client';
export const dynamic = "force-dynamic";

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserAlt } from 'react-icons/fa';
import { MdShoppingCart, MdMoreVert } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';
import SearchBarWithResults from './search';
import SlidingCart from './Slidingcart';
import { useCart } from './CartContextProvider';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { clearCart, cartCount } = useCart();

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
      await signOut({ redirect: false });
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setProfileOpen(false);
  };

  // Close dropdowns on outside click
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
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-black text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-lg border-b border-gray-800">
      {/* Left: Logo */}
      <Link href={'/'}>
        <div className="flex items-center space-x-4">
          <Image src="/home/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-md md:text-2xl font-bold tracking-wide uppercase">Zestwear</h1>
        </div>
      </Link>

      {/* Desktop Search (only >1110px) */}
      <div className="hidden min-[1111px]:flex flex-grow max-w-xs sm:max-w-md mx-6 bg-gray-900 rounded-full shadow-md p-1">
        <div className="w-full max-w-xl mx-auto">
          <SearchBarWithResults />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Desktop Links (only >1110px) */}
        <div className="hidden min-[1111px]:flex space-x-6 text-lg font-semibold flex-grow justify-between mr-20">
          <Link href="/" className="hover:text-yellow-400 transition">Home</Link>
          <Link href="/Customise" className="hover:text-yellow-400 transition">Customize</Link>
          <Link href="/contact" className="hover:text-yellow-400 transition">Contact</Link>
          <Link href="/about" className="hover:text-yellow-400 transition">About</Link>
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
                className="rounded-full cursor-pointer border border-white hover:opacity-80 transition"
                onClick={handleProfileClick}
                unoptimized
              />
            ) : (
              <FaUserAlt
                size={22}
                className="cursor-pointer hover:text-yellow-400 transition"
                onClick={handleProfileClick}
              />
            )
          ) : (
            <FaUserAlt size={22} className="cursor-pointer hover:text-yellow-400 transition" onClick={handleSignInClick} />
          )}

          {/* Profile dropdown */}
          {isProfileOpen && session?.user && (
            <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-md shadow-lg z-50 border border-gray-600">
              <button
                className="w-full text-left px-4 py-2 hover:text-yellow-400 transition"
                onClick={() => { router.push('/profile'); setProfileOpen(false); }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:text-yellow-400 transition"
                onClick={() => { router.push('/orders'); setProfileOpen(false); }}
              >
                My Orders
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-200 text-red-500 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
          <MdShoppingCart size={26} className="hover:text-yellow-400 transition" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1 animate-[pop_0.3s_ease]">
              {cartCount}
            </span>
          )}
        </div>

        {/* Sliding Cart */}
        <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* Menu Icon (only <=1110px) */}
        <div ref={menuRef} className="relative block max-[1110px]:block min-[1111px]:hidden">
          <MdMoreVert
            size={26}
            className="cursor-pointer hover:text-gray-400 transition"
            onClick={() => {
              setMenuOpen((o) => !o);
              setProfileOpen(false);
            }}
          />

          {isMenuOpen && (
            <div className="fixed top-16 right-4 w-[90vw] max-w-sm bg-black text-white rounded-lg shadow-lg border border-gray-600 z-50 p-4">
              <Link href="/" className="block py-2 hover:text-yellow-400 w-full" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/Customise" className="block py-2 hover:text-yellow-400 w-full" onClick={() => setMenuOpen(false)}>Customize</Link>
              <Link href="/contact" className="block py-2 hover:text-yellow-400 w-full" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/about" className="block py-2 hover:text-yellow-400 w-full" onClick={() => setMenuOpen(false)}>About</Link>
              <div className="mt-4 w-full flex justify-center">
                <div className="flex items-center bg-gray-900 rounded-full px-2 py-1 shadow-inner w-full max-w-xs">
                  <SearchBarWithResults />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}