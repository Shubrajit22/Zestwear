'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { OrderItem } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  address: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  orderItems: OrderItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  addresses: Address[];
  orders?: Order[];
  isAdmin?: boolean;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [selectedSection, setSelectedSection] = useState<
    'orders' | 'profile' | 'addresses' | 'admin'
  >('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/profile?email=${session.user.email}`);
        setUser(res.data);
      } catch (error) {
        toast.error('Failed to fetch profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  const isAdmin = user?.isAdmin === true;

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!user || !newAddress.trim()) return;

    try {
      const res = await axios.post('/api/profile', { address: newAddress });
      setUser((prev) =>
        prev ? { ...prev, addresses: [...prev.addresses, res.data] } : prev
      );
      toast.success('Address added');
      setNewAddress('');
    } catch (error) {
      toast.error('Failed to add address');
      console.log(error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    try {
      await axios.delete(`/api/profile?addressId=${id}`);
      setUser((prev) =>
        prev ? { ...prev, addresses: prev.addresses.filter((a) => a.id !== id) } : prev
      );
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
      console.log(error);
    }
  };

  if (status === 'loading' || loading)
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-600">Loading profile...</div>
      </div>
    );
  if (!session || !user)
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">You are not logged in.</div>
      </div>
    );

  const userData = session.user as SessionUser;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-[90%] mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left panel / top on mobile */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md flex flex-col items-center text-center">
            <div className="mb-3">
              {userData.image ? (
                <Image
                  src={userData.image}
                  alt="User profile"
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-800">
                {userData.name || 'Customer'}
              </p>
            </div>
            <div className="mt-4 w-full space-y-2">
              <div
                className={`w-full rounded-md px-4 py-2 text-sm font-medium cursor-pointer ${
                  selectedSection === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setSelectedSection('profile')}
              >
                Profile
              </div>
              <div
                className={`w-full rounded-md px-4 py-2 text-sm font-medium cursor-pointer ${
                  selectedSection === 'addresses'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setSelectedSection('addresses')}
              >
                Addresses
              </div>
              {isAdmin && (
                <div
                  className={`w-full rounded-md px-4 py-2 text-sm font-medium cursor-pointer ${
                    selectedSection === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedSection('admin');
                    router.push('/admin');
                  }}
                >
                  Admin Panel
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
              >
                ⏻ Log Out
              </button>
            </div>
          </div>

          {/* On mobile: section tabs (redundant but visible when sidebar collapses) */}
          <div className="lg:hidden bg-white rounded-xl shadow-md px-4 py-3 flex gap-2 overflow-x-auto">
            <div
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full cursor-pointer whitespace-nowrap ${
                selectedSection === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedSection('profile')}
            >
              Profile
            </div>
            <div
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full cursor-pointer whitespace-nowrap ${
                selectedSection === 'addresses'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedSection('addresses')}
            >
              Addresses
            </div>
            {isAdmin && (
              <div
                className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full cursor-pointer whitespace-nowrap ${
                  selectedSection === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedSection('admin');
                  router.push('/admin');
                }}
              >
                Admin
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Section content */}
          {selectedSection === 'profile' && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-semibold mb-6">Profile Information</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase mb-1">Name</span>
                  <div className="text-gray-800 font-medium">{user.name}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase mb-1">Email</span>
                  <div className="text-gray-800 font-medium">{user.email}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase mb-1">Mobile</span>
                  <div className="text-gray-800 font-medium">{user.mobile}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase mb-1">Role</span>
                  <div className="text-gray-800 font-medium">
                    {user.isAdmin ? 'Admin' : 'User'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'addresses' && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-semibold">Manage Addresses</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Add, remove or update your shipping addresses.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col sm:flex-row justify-between bg-gray-50 p-4 rounded shadow-sm gap-3"
                  >
                    <div className="break-words">{addr.address}</div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="New address"
                  className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddAddress}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Add Address
                </button>
              </div>
            </div>
          )}
          {/* You can insert orders section similarly if needed */}
        </div>
      </div>
    </div>
  );
}
