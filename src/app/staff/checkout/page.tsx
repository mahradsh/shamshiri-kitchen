'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { collection, addDoc, query, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CartItem {
  item: {
    id: string;
    name: string;
    namePersian: string;
  };
  quantity: number;
}

interface OrderCart {
  items: CartItem[];
  location: string;
  date: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  const date = searchParams.get('date');
  
  const [cart, setCart] = useState<OrderCart | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'Staff') {
      router.push('/');
      return;
    }
    
    if (!location || !date) {
      router.push('/staff');
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('orderCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push('/staff');
    }
  }, [user, location, date, router]);

  const handlePlaceOrder = async () => {
    if (!cart || !user) return;

    setLoading(true);
    try {
      // Generate a short, simple order number
      const orderNumber = Math.floor(10000 + Math.random() * 90000).toString();
      
      const orderData = {
        orderNumber: orderNumber,
        orderDate: new Date(cart.date),
        location: cart.location,
        placedBy: user.id,
        placedByName: user.fullName,
        items: cart.items.map(cartItem => ({
          itemId: cartItem.item.id,
          itemName: cartItem.item.name,
          itemNamePersian: cartItem.item.namePersian,
          quantity: cartItem.quantity
        })),
        staffNote: note,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart and redirect immediately
      localStorage.removeItem('orderCart');
      router.push('/staff?success=order-placed&tab=my-orders');
      
      // Send SMS notification to admin async (fire and forget)
      try {
        const settingsQuery = query(collection(db, 'settings'), limit(1));
        const settingsDoc = await getDocs(settingsQuery);
        
        if (!settingsDoc.empty) {
          const smsSettings = settingsDoc.docs[0].data();
          if (smsSettings.enabled && (smsSettings.phoneNumbers && smsSettings.phoneNumbers.length > 0)) {
            // Send SMS to all configured numbers without waiting
            smsSettings.phoneNumbers.forEach((phoneNumber: string) => {
              if (phoneNumber.trim()) {
                fetch('/api/send-sms', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phoneNumber: phoneNumber.trim(),
                    orderNumber: orderNumber,
                    location: cart.location,
                    itemCount: cart.items.length,
                    placedBy: user.fullName,
                    orderItems: cart.items.map(item => ({
                      name: item.item.namePersian || item.item.name,
                      quantity: item.quantity
                    }))
                  })
                }).then(() => {
                  console.log(`SMS notification sent successfully to ${phoneNumber}`);
                }).catch((smsError) => {
                  console.error(`Failed to send SMS notification to ${phoneNumber}:`, smsError);
                });
              }
            });
          } else {
            console.log('SMS notifications are disabled or no phone numbers configured');
          }
        } else {
          console.log('No SMS settings found in database');
        }
      } catch (smsError) {
        console.error('Failed to load SMS settings:', smsError);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-center py-4 px-4">
          <img 
            src="/shamshiri.jpg" 
            alt="Shamshiri Restaurant Logo" 
            className="w-10 h-10 rounded-full shadow-sm object-cover border"
            style={{ borderColor: '#b32127' }}
          />
          <h1 className="ml-3 text-lg font-semibold text-red-600">
            Shamshiri Ordering System
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            Order Summary
          </h2>

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Branch:</span>
              <span className="text-gray-600">{cart.location}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Date:</span>
              <span className="text-gray-600">{cart.date}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Ordered by:</span>
              <span className="text-gray-600">Staff User</span>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            {cart.items.map((cartItem) => (
              <div key={cartItem.item.id} className="flex justify-between items-center py-2">
                <span className="text-gray-900">{cartItem.item.name}</span>
                <span className="font-medium text-gray-900">{cartItem.quantity}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </main>
    </div>
  );
} 