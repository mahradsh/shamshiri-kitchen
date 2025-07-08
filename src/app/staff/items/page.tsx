'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Item } from '../../../types';
import { Search, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

interface CartItem {
  item: Item;
  quantity: number;
}

function ItemsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  const date = searchParams.get('date');
  
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load before making redirect decisions
    if (authLoading) return;
    
    if (!user || user.role !== 'Staff') {
      router.push('/');
      return;
    }
    
    if (!location || !date) {
      router.push('/staff');
      return;
    }

    loadItems();
  }, [user, location, date, router, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadItems = async () => {
    try {
      const itemsQuery = query(
        collection(db, 'items'),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(itemsQuery);
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Item));

      // Filter items based on location
      const filteredItems = itemsData.filter(item => 
        item.assignedLocations.includes('Both') || 
        item.assignedLocations.includes(location! as any)
      );

      setItems(filteredItems.sort((a, b) => a.displayOrder - b.displayOrder));
      setLoading(false);
    } catch (error) {
      console.error('Error loading items:', error);
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateQuantity = (item: Item, newQuantity: number) => {
    if (newQuantity < 0) return;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.item.id === item.id);
      
      if (existingItemIndex >= 0) {
        if (newQuantity === 0) {
          return prevCart.filter(cartItem => cartItem.item.id !== item.id);
        } else {
          const newCart = [...prevCart];
          newCart[existingItemIndex].quantity = newQuantity;
          return newCart;
        }
      } else if (newQuantity > 0) {
        return [...prevCart, { item, quantity: newQuantity }];
      }
      
      return prevCart;
    });
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(cartItem => cartItem.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  const handleContinue = () => {
    if (cart.length > 0) {
      const cartData = {
        items: cart,
        location,
        date,
      };
      
      localStorage.setItem('orderCart', JSON.stringify(cartData));
      router.push(`/staff/checkout?location=${encodeURIComponent(location!)}&date=${date}`);
    }
  };

  if (loading) {
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
          <Image 
            src="/shamshiri.jpg" 
            alt="Shamshiri Restaurant Logo" 
            width={40}
            height={40}
            className="rounded-full shadow-sm object-cover border"
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
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
            Select Items for {date}
          </h2>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              style={{ 
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            />
          </div>

          {/* Items List */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 farsi-item" style={{ color: '#000000' }}>
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item, quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <div className="w-16 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white">
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => updateQuantity(item, parseInt(e.target.value) || 0)}
                        className="w-full text-center border-0 bg-transparent text-lg font-bold text-gray-900 focus:outline-none"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    
                    <button
                      onClick={() => updateQuantity(item, quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {getTotalItems()} items selected
            </span>
            
            <button
              onClick={handleContinue}
              disabled={cart.length === 0}
              className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    }>
      <ItemsPageContent />
    </Suspense>
  );
} 