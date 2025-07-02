# Shamshiri Kitchen Setup Instructions

## 🚀 Quick Start

### 1. Firebase Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kitchen-shamshiri`

### 2. Set Up Authentication

1. **Enable Email/Password Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Click **Save**

2. **Create Admin User**:
   - Go to **Authentication** → **Users**
   - Click **Add user**
   - Email: `admin@shamshiri.com`
   - Password: `admin123456`
   - Click **Add user**

### 3. Set Up Firestore Database

1. **Create Firestore Database**:
   - Go to **Firestore Database**
   - Click **Create database**
   - Choose **Start in test mode** (for now)
   - Select your region
   - Click **Done**

2. **Update Security Rules**:
   - Go to **Firestore Database** → **Rules**
   - Copy the contents of `firestore.rules` file
   - Paste it and click **Publish**

### 4. Test the Application

1. **Start the app**: `npm run dev`
2. **Visit**: http://localhost:3001
3. **Login with**:
   - Email: `admin@shamshiri.com`
   - Password: `admin123456`

## ✅ What Happens Automatically

When you log in with the admin account:

1. **User Document Created**: Admin user profile is automatically created in Firestore
2. **Items Collection**: All menu items are automatically added to the database
3. **Collections Setup**: All necessary Firestore collections are created

## 🔧 Collections Created

- **`users`**: User profiles and permissions
- **`items`**: Menu items for ordering
- **`orders`**: Customer orders (created when first order is placed)

## 📝 Default Items Added

The system automatically adds these items:
- Soup, Spinach, Eggplant, Grilled Eggplant
- White Rice, Farmed Fish, Chicken Thigh, Chicken Breast
- Rice with Meat, Leek Stew, Yogurt Drink
- And many more Persian dishes...

## 🎯 Next Steps

After successful login:
- **Admin users** → Redirected to `/admin` panel
- **Staff users** → Redirected to `/staff` ordering interface

## 🔒 Security Note

The current Firestore rules allow any authenticated user to read/write. For production, implement role-based security rules.

---

**Need Help?** Check the browser console for detailed logs during the setup process. 