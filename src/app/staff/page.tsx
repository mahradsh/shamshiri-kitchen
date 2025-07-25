'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Location } from '../../types';
import { MapPin, LogOut, ShoppingCart, Calendar, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import DashiFooter from '../../components/DashiFooter';

interface Order {
  id: string;
  orderNumber: string;
  orderDate: any;
  location: string;
  placedBy: string;
  placedByName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    itemNamePersian: string;
    quantity: number;
  }>;
  staffNote?: string;
  status: string;
  createdAt: any;
  updatedAt: any;
}

function StaffDashboardContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new-order' | 'all-orders'>('new-order');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Check for success message and tab
  const success = searchParams.get('success');
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    // Wait for auth to load before making redirect decisions
    if (authLoading) return;
    
    if (!user) {
      router.push('/');
      return;
    }
    
    if (user.role !== 'Staff') {
      router.push('/admin');
      return;
    }
    
    setLoading(false);
  }, [user, router, authLoading]);

  // Handle tab parameter from URL
  useEffect(() => {
    if (tabParam === 'all-orders') {
      setActiveTab('all-orders');
    }
  }, [tabParam]);

  useEffect(() => {
    if (activeTab === 'all-orders' && user) {
      loadMyOrders();
    }
  }, [activeTab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show success message
  useEffect(() => {
    if (success === 'order-placed') {
      // Always refresh orders when order is placed
      loadMyOrders();
      // Remove the success parameter from URL after a delay
      setTimeout(() => {
        router.replace('/staff', { scroll: false });
      }, 2000);
    }
  }, [success, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMyOrders = async () => {
    if (!user) return;
    
    setOrdersLoading(true);
    try {
      console.log('Loading orders for user:', user.id);
      
      // First try to get all orders, then filter - this avoids composite index issues
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ordersQuery);
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      console.log('All orders:', allOrders);
      
      // Show all orders to all staff (no filtering by user)
      console.log('All orders for staff view:', allOrders);
      
      setMyOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLocationSelect = (location: Location) => {
    router.push(`/staff/calendar?location=${encodeURIComponent(location)}`);
  };



  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Location access based on user email
  const getAvailableLocations = (): Location[] => {
    if (!user?.email) return [];
    
    switch (user.email) {
      case 'northyork@shamshiri.com':
        return ['North York'];
      case 'thornhill@shamshiri.com':
        return ['Thornhill'];
      case 'manager@shamshiri.com':
        return ['North York', 'Thornhill'];
      default:
        // Fallback for other accounts (including admin)
        return ['North York', 'Thornhill'];
    }
  };

  const availableLocations: Location[] = getAvailableLocations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {success === 'order-placed' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Order placed successfully!</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center mb-4">
              <Image 
                src="/shamshiri.jpg" 
                alt="Shamshiri Restaurant Logo" 
                width={64}
                height={64}
                className="rounded-full shadow-md object-cover border-2"
                style={{ borderColor: '#b32127' }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Staff Dashboard
            </h1>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('new-order')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'new-order'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                New Order
              </button>
              <button
                onClick={() => setActiveTab('all-orders')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all-orders'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Orders
              </button>
            </div>
          </div>

          {activeTab === 'new-order' ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Select Location:
              </h2>
              
              <div className="space-y-4">
                {availableLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full p-6 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <MapPin className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {location}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {location === 'North York' ? 'Main Branch' : 'Secondary Branch'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                All Orders
              </h2>
              
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : myOrders.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-700">Delivery Date:</span> {formatDate(order.orderDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-green-700">Order Placed:</span> {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'} at {order.createdAt?.toDate?.()?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">Location:</span> {order.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-purple-700">Placed by:</span> {order.placedByName || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            order.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'Complete'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">
                          <span className="font-medium text-gray-700">Items:</span>
                        </p>
                        <div className="space-y-1">
                                                     {order.items?.map((item, index) => (
                             <div key={index} className="flex justify-between items-center">
                               <span className="text-gray-800 farsi-item" style={{ color: '#1f2937', direction: 'rtl', textAlign: 'right' }}>{item.itemName}</span>
                               <span className="font-bold text-gray-900 text-lg" style={{ color: '#000000' }}>×{item.quantity}</span>
                             </div>
                           ))}
                        </div>
                        
                        {order.staffNote && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Note:</span> {order.staffNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    No orders have been placed yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Dashi Footer */}
        <DashiFooter />
      </main>
    </div>
  );
}

export default function StaffDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    }>
      <StaffDashboardContent />
    </Suspense>
  );
} 