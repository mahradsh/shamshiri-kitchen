'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  updateDoc,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item, Order } from '@/types';
import { Trash2, Edit } from 'lucide-react';

type ActiveTab = 'items' | 'orders' | 'users';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('items');
  
  // Items state
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['North York', 'Thornhill']);
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Notification Settings state
  const [adminPhoneNumbers, setAdminPhoneNumbers] = useState<string[]>(['', '', '', '', '', '']);
  const [adminEmails, setAdminEmails] = useState<string[]>(['', '', '', '', '', '']);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    if (user.role !== 'Admin') {
      router.push('/staff');
      return;
    }
    
    setLoading(false);
    loadItems();
    loadOrders();
    loadNotificationSettings();
  }, [user, router]);

  const loadItems = async () => {
    try {
      const itemsQuery = query(collection(db, 'items'), orderBy('displayOrder'));
      const snapshot = await getDocs(itemsQuery);
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Item));
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      // Try to load from Firebase first
      const settingsDoc = await getDocs(query(collection(db, 'settings'), limit(1)));
      if (!settingsDoc.empty) {
        const settings = settingsDoc.docs[0].data();
        if (settings.phoneNumbers && Array.isArray(settings.phoneNumbers)) {
          setAdminPhoneNumbers([...settings.phoneNumbers, '', '', '', '', '', ''].slice(0, 6));
        }
        if (settings.emailAddresses && Array.isArray(settings.emailAddresses)) {
          setAdminEmails([...settings.emailAddresses, '', '', '', '', '', ''].slice(0, 6));
        }
        setSmsEnabled(settings.smsEnabled || false);
        setEmailEnabled(settings.emailEnabled || false);
      } else {
        // Fallback to localStorage for migration
        const saved = localStorage.getItem('smsSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          // Handle legacy single phone number or new array format
          if (settings.phoneNumbers && Array.isArray(settings.phoneNumbers)) {
            setAdminPhoneNumbers([...settings.phoneNumbers, '', '', '', '', '', ''].slice(0, 6));
          } else if (settings.phoneNumber) {
            setAdminPhoneNumbers([settings.phoneNumber, '', '', '', '', '']);
          }
          setSmsEnabled(settings.enabled || false);
          
          // Migrate to Firebase
          const validPhoneNumbers = (settings.phoneNumbers || [settings.phoneNumber]).filter(num => num && num.trim());
          if (validPhoneNumbers.length > 0 || settings.enabled) {
            await addDoc(collection(db, 'settings'), {
              phoneNumbers: validPhoneNumbers,
              emailAddresses: [],
              smsEnabled: settings.enabled || false,
              emailEnabled: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            localStorage.removeItem('smsSettings'); // Clean up old storage
          }
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const itemData = {
        name: newItemName,
        namePersian: newItemName,
        displayOrder: items.length + 1,
        assignedLocations: selectedLocations,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'items'), itemData);
      setNewItemName('');
      setSelectedLocations(['North York', 'Thornhill']);
      loadItems(); // Reload items
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'items', itemId));
        loadItems(); // Reload items
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Complete',
        updatedAt: new Date()
      });
      loadOrders(); // Reload orders
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      // Filter out empty phone numbers and emails
      const validPhoneNumbers = adminPhoneNumbers.filter(num => num.trim());
      const validEmails = adminEmails.filter(email => email.trim());
      
      // Check if settings document exists
      const settingsQuery = query(collection(db, 'settings'), limit(1));
      const settingsDoc = await getDocs(settingsQuery);
      
      const settingsData = {
        phoneNumbers: validPhoneNumbers,
        emailAddresses: validEmails,
        smsEnabled: smsEnabled,
        emailEnabled: emailEnabled,
        updatedAt: new Date()
      };
      
      if (!settingsDoc.empty) {
        // Update existing settings
        const settingsId = settingsDoc.docs[0].id;
        await updateDoc(doc(db, 'settings', settingsId), settingsData);
      } else {
        // Create new settings document
        await addDoc(collection(db, 'settings'), {
          ...settingsData,
          createdAt: new Date()
        });
      }
      
      alert('Notification settings saved successfully! Settings will now sync across all devices.');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save notification settings');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const renderItemsTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Add New Item */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">Add New Item</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name (Persian):
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="نام غذا را وارد کنید..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 farsi-item"
              style={{ direction: 'rtl', textAlign: 'right' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available At:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes('North York')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations([...selectedLocations, 'North York']);
                    } else {
                      setSelectedLocations(selectedLocations.filter(loc => loc !== 'North York'));
                    }
                  }}
                  className="mr-2 w-4 h-4 text-red-600"
                />
                <span className="font-medium text-sm" style={{ color: '#000000' }}>North York</span>
              </label>
              <label className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes('Thornhill')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations([...selectedLocations, 'Thornhill']);
                    } else {
                      setSelectedLocations(selectedLocations.filter(loc => loc !== 'Thornhill'));
                    }
                  }}
                  className="mr-2 w-4 h-4 text-red-600"
                />
                <span className="font-medium text-sm" style={{ color: '#000000' }}>Thornhill</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim() || selectedLocations.length === 0}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 shadow-sm hover:shadow-md"
          >
            Add Item to Menu
          </button>
        </div>
      </div>

      {/* Current Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Items:</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <h4 className="font-bold text-lg text-gray-900 farsi-item break-words" style={{ color: '#000000', direction: 'rtl', textAlign: 'center', lineHeight: '1.4' }}>
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {item.assignedLocations.includes('Both') 
                        ? 'North York, Thornhill' 
                        : item.assignedLocations.join(', ')
                      }
                    </span>
                  </div>
                </div>
                
                {/* Delete Button */}
                <div className="flex justify-center sm:justify-end sm:ml-4">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-red-600 hover:bg-red-50 rounded-full transition-colors border-2 border-red-200 hover:border-red-300"
                    title="Delete item"
                  >
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
      </div>
      <div className="p-4">
        {orders.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900" style={{ color: '#000000' }}>
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-700">Delivery Date:</span> {order.orderDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-green-700">Order Placed:</span> {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'} at {order.createdAt?.toDate?.()?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">Location:</span> {order.location} • <span className="font-medium text-gray-800">By:</span> {order.placedByName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      order.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'Complete'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                    {order.status === 'Active' && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Complete
                      </button>
                    )}
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
          <div className="text-center py-12 text-gray-500">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">User Management & Notifications</h3>
      
      {/* Notification Settings */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Notification Settings</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-6">
            
            {/* SMS Settings */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="sms-enabled"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="sms-enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enable SMS notifications for new orders
                </label>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Phone Numbers (up to 6):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminPhoneNumbers.map((phoneNumber, index) => (
                  <input
                    key={index}
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const newNumbers = [...adminPhoneNumbers];
                      newNumbers[index] = e.target.value;
                      setAdminPhoneNumbers(newNumbers);
                    }}
                    placeholder={`Phone ${index + 1}: +1 (416) 123-456${index + 7}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Email Settings */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="email-enabled"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="email-enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enable email notifications for new orders
                </label>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Addresses (up to 6):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminEmails.map((email, index) => (
                  <input
                    key={index}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...adminEmails];
                      newEmails[index] = e.target.value;
                      setAdminEmails(newEmails);
                    }}
                    placeholder={`Email ${index + 1}: admin${index + 1}@shamshiri.com`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#000000'
                    }}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveNotificationSettings}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>

             {/* Notification Status */}
       <div className="mb-8">
         <h4 className="text-md font-semibold text-gray-800 mb-4">Notification Status</h4>
         <div className="bg-blue-50 rounded-lg p-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
             <div>
               <span className="font-medium text-blue-800">Status:</span>
               <p className="text-green-700 font-medium">✓ Connected</p>
             </div>
             <div>
               <span className="font-medium text-blue-800">Active Recipients:</span>
               <p className="text-blue-700">
                 SMS: {adminPhoneNumbers.filter(num => num.trim()).length || 0} | 
                 Email: {adminEmails.filter(email => email.trim()).length || 0}
               </p>
             </div>
           </div>
           {(adminPhoneNumbers.filter(num => num.trim()).length > 0 || adminEmails.filter(email => email.trim()).length > 0) && (
             <div className="border-t border-blue-200 pt-3">
               {adminPhoneNumbers.filter(num => num.trim()).length > 0 && (
                 <div className="mb-3">
                   <span className="font-medium text-blue-800 text-sm">Configured Phone Numbers:</span>
                   <div className="mt-2 space-y-1">
                     {adminPhoneNumbers.filter(num => num.trim()).map((num, index) => (
                       <p key={index} className="text-blue-700 text-sm font-mono">{num}</p>
                     ))}
                   </div>
                 </div>
               )}
               {adminEmails.filter(email => email.trim()).length > 0 && (
                 <div>
                   <span className="font-medium text-blue-800 text-sm">Configured Email Addresses:</span>
                   <div className="mt-2 space-y-1">
                     {adminEmails.filter(email => email.trim()).map((email, index) => (
                       <p key={index} className="text-blue-700 text-sm font-mono">{email}</p>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       </div>

      {/* User Management */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4">User Management</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-medium text-gray-900 mb-3">Authentication System</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <div>
                <p className="text-sm font-medium text-gray-900">Firebase Authentication</p>
                <p className="text-xs text-gray-600">Email/Password & Google Sign-in</p>
              </div>
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <div>
                <p className="text-sm font-medium text-gray-900">Role-Based Access</p>
                <p className="text-xs text-gray-600">Admin and Staff permissions</p>
              </div>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                Secured
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            User accounts are managed through Firebase Console
          </p>
          {/* Show demo credentials only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800 mb-2">Development Mode:</p>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Admin: admin@shamshiri.com / admin123</p>
                <p>Staff: staff@shamshiri.com / staff123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/shamshiri.jpg" 
                alt="Shamshiri Restaurant Logo" 
                className="w-16 h-16 rounded-full shadow-md object-cover border-2"
                style={{ borderColor: '#b32127' }}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              Admin Panel
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 min-w-0 py-3 sm:py-4 px-3 sm:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'items'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Items
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 min-w-0 py-3 sm:py-4 px-3 sm:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 min-w-0 py-3 sm:py-4 px-3 sm:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === 'items' && renderItemsTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'users' && renderUsersTab()}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-6 sm:mt-8 pb-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition-colors rounded-lg border border-red-200 hover:border-red-300"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
} 