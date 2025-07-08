# 🔥 Firebase Setup Instructions

## 📋 Quick Setup Checklist

### 1. Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kitchen-shamshiri`

### 2. Enable Authentication

1. **Go to Authentication** → **Sign-in method**
2. **Enable Email/Password authentication**
3. **Click Save**

### 3. Create Users

#### Admin User
1. **Go to Authentication** → **Users**
2. **Click "Add user"**
3. **Enter**:
   - Email: `admin@shamshiri.com`
   - Password: `admin123`
4. **Click "Add user"**

#### Staff Users
Create these 3 staff accounts with the specified location access:

**1. North York Staff (Can only order for North York)**
1. **Click "Add user"**
2. **Enter**:
   - Email: `northyork@shamshiri.com`
   - Password: `staff123`
3. **Click "Add user"**

**2. Thornhill Staff (Can only order for Thornhill)**  
1. **Click "Add user"**
2. **Enter**:
   - Email: `thornhill@shamshiri.com`
   - Password: `thornhill456`
3. **Click "Add user"**

**3. Store Manager (Can order for both stores)**
1. **Click "Add user"**
2. **Enter**:
   - Email: `manager@shamshiri.com`
   - Password: `manager789`
3. **Click "Add user"**

### 4. Set Up Firestore Database

1. **Go to Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"**
4. **Select your region**
5. **Click "Done"**

### 5. Update Security Rules

1. **Go to Firestore Database** → **Rules**
2. **Replace with the contents from `firestore.rules` file**
3. **Click "Publish"**

## 🎯 Testing the Application

### Login Credentials

| Account Type | Email | Password | Access |
|-------------|-------|----------|---------|
| Admin | admin@shamshiri.com | admin123 | Full admin access |
| North York Staff | northyork@shamshiri.com | staff123 | Only North York location & items |
| Thornhill Staff | thornhill@shamshiri.com | thornhill456 | Only Thornhill location & items |
| Store Manager | manager@shamshiri.com | manager789 | Both North York and Thornhill |

### Staff Flow (All Accounts)

**All Staff Accounts:**
- Login → Shows location picker (only allowed locations based on user email)
- Select allowed location → Calendar → Items (filtered by location)
- Place orders only for allowed locations with location-specific items

## ✅ What Happens Automatically

When you log in:
- **Admin account**: Creates admin user document + seeds all menu items
- **Staff accounts**: Creates staff user documents with correct location assignments
- **Collections**: Creates `users`, `items`, `orders`, and `settings` collections in Firestore

## 🔧 Features Implemented

### Staff Interface
- ✅ Clean location selection dashboard  
- ✅ Calendar for date selection
- ✅ Item selection with search and quantity controls
- ✅ Order summary with notes
- ✅ Order placement with Firebase storage
- ✅ **Email/Password authentication only**

### Admin Interface  
- ✅ Tabbed interface (Add Items, Orders, Users)
- ✅ Add/edit/delete items with location assignment
- ✅ View all orders in real-time with notes and delivery dates
- ✅ Void orders (admin only)
- ✅ User management information
- ✅ Notification settings (up to 6 phone numbers and 6 emails)

### Location Access
- ✅ **North York Staff**: Can only order for North York location
- ✅ **Thornhill Staff**: Can only order for Thornhill location
- ✅ **Store Manager**: Can order for both North York and Thornhill locations
- ✅ **Admin**: Full access to all locations and admin features
- ✅ **Location Picker**: Shows only allowed locations based on user email
- ✅ **Items**: Staff only see items assigned to their location + items marked as "Both"

### Notification System
- ✅ SMS notifications with notes and delivery date
- ✅ Email notifications with detailed order information
- ✅ Support for multiple recipients (6 phones + 6 emails)
- ✅ Async delivery for fast order placement

### Technical Features
- ✅ Automatic user document creation with location assignments
- ✅ Firebase Firestore integration
- ✅ **Email/Password authentication only**
- ✅ Real-time data loading
- ✅ Responsive mobile-first design
- ✅ Admin-only order voiding
- ✅ Item editing for admins

## 🚫 Removed Features
- ❌ Google Sign-in authentication (removed completely)
- ❌ Staff order voiding (now admin-only)

## 📱 Staff Account Behavior

All staff accounts have the same access with good UX:

- **Location Picker**: Shows only allowed locations based on user email
- **Available Locations**: North York staff see only North York, Thornhill staff see only Thornhill, Manager sees both
- **Item Access**: Staff only see items assigned to their location + items marked as "Both"
- **Order Placement**: Staff can place orders for any location they choose

This ensures that:
1. All staff have flexibility to order for either location
2. No restrictions based on staff member assignments
3. Simplified management - all staff accounts work the same way
4. UI remains consistent and user-friendly for all staff 