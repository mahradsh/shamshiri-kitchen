# 🔥 Firebase Setup Instructions

## 📋 Quick Setup Checklist

### 1. Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kitchen-shamshiri`

### 2. Enable Authentication

1. **Go to Authentication** → **Sign-in method**
2. **Enable Email/Password authentication**
3. **Click Save**

### 3. Create Demo Users

#### Admin User
1. **Go to Authentication** → **Users**
2. **Click "Add user"**
3. **Enter**:
   - Email: `admin@shamshiri.com`
   - Password: `admin123`
4. **Click "Add user"**

#### Staff User
1. **Click "Add user" again**
2. **Enter**:
   - Email: `staff@shamshiri.com`
   - Password: `staff123`
3. **Click "Add user"**

### 4. Set Up Firestore Database

1. **Go to Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"**
4. **Select your region**
5. **Click "Done"**

### 5. Update Security Rules

1. **Go to Firestore Database** → **Rules**
2. **Replace with**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. **Click "Publish"**

## 🎯 Testing the Application

### Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@shamshiri.com | admin123 |
| Staff | staff@shamshiri.com | staff123 |

### Staff Flow
1. **Login** with staff credentials
2. **Select location** (North York or Thornhill)
3. **Choose date** from calendar
4. **Select items** with quantities
5. **Review order summary**
6. **Place order**

### Admin Flow
1. **Login** with admin credentials
2. **Add Items tab**: Add new menu items and assign to locations
3. **Orders tab**: View all placed orders
4. **Users tab**: View demo credentials (user creation via Firebase Console)

## ✅ What Happens Automatically

When you log in:
- **Admin account**: Creates admin user document + seeds all menu items
- **Staff account**: Creates staff user document automatically
- **Collections**: Creates `users`, `items`, `orders`, and `settings` collections in Firestore
- **SMS Settings**: Admin phone numbers and SMS preferences sync across all devices

## 🔧 Features Implemented

### Staff Interface
- ✅ Clean location selection dashboard
- ✅ Calendar for date selection
- ✅ Item selection with search and quantity controls
- ✅ Order summary with notes
- ✅ Order placement with Firebase storage

### Admin Interface  
- ✅ Tabbed interface (Add Items, Orders, Users)
- ✅ Add/delete items with location assignment
- ✅ View all orders in real-time
- ✅ User management information
- ✅ SMS notification settings (up to 3 phone numbers)
- ✅ Cross-device settings synchronization

### Technical Features
- ✅ Automatic user document creation
- ✅ Firebase Firestore integration
- ✅ Real-time data loading
- ✅ Responsive mobile-first design
- ✅ Persian/Farsi language support with proper fonts
- ✅ Twilio SMS integration for order notifications
- ✅ Cross-device settings synchronization via Firebase
- ✅ Async SMS delivery for fast order placement

## 🚀 Ready to Use!

1. **Complete Firebase setup** above
2. **Run**: `npm run dev`
3. **Visit**: http://localhost:3001
4. **Login** with demo credentials

Everything works automatically! 🎉 