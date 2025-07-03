# 🔥 Firebase Setup Instructions

## 📋 Quick Setup Checklist

### 1. Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kitchen-shamshiri`

### 2. Enable Authentication

1. **Go to Authentication** → **Sign-in method**
2. **Enable Email/Password authentication**
3. **Enable Google Sign-in for Staff**:
   - Click on **Google** sign-in provider
   - Toggle to **Enable**
   - Set Project support email (use your email)
   - Click **Save**
4. **Click Save**

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

### Staff Authentication Options
1. **Email/Password Login** with staff credentials
2. **Google Sign-in** (automatically creates staff account)

### Staff Flow
1. **Login** with staff credentials or Google
2. **Select location** (North York or Thornhill)
3. **Choose date** from calendar
4. **Select items** with quantities
5. **Review order summary**
6. **Place order** (triggers both SMS and email notifications)

### Admin Flow
1. **Login** with admin credentials
2. **Add Items tab**: Add new menu items and assign to locations
3. **Orders tab**: View all placed orders with notes and delivery dates
4. **Users tab**: Configure notification settings (up to 6 phone numbers and 6 emails)

## ✅ What Happens Automatically

When you log in:
- **Admin account**: Creates admin user document + seeds all menu items
- **Staff account**: Creates staff user document automatically
- **Google Sign-in**: Creates staff user with Google display name
- **Collections**: Creates `users`, `items`, `orders`, and `settings` collections in Firestore
- **Notification Settings**: Supports up to 6 phone numbers and 6 email addresses

## 🔧 Features Implemented

### Staff Interface
- ✅ Clean location selection dashboard
- ✅ Calendar for date selection
- ✅ Item selection with search and quantity controls
- ✅ Order summary with notes
- ✅ Order placement with Firebase storage
- ✅ Google Sign-in authentication

### Admin Interface  
- ✅ Tabbed interface (Add Items, Orders, Users)
- ✅ Add/delete items with location assignment
- ✅ View all orders in real-time with notes and delivery dates
- ✅ User management information
- ✅ Notification settings (up to 6 phone numbers and 6 emails)
- ✅ Cross-device settings synchronization

### Notification System
- ✅ SMS notifications with notes and delivery date
- ✅ Email notifications with detailed order information
- ✅ Support for multiple recipients (6 phones + 6 emails)
- ✅ Async delivery for fast order placement

### Technical Features
- ✅ Automatic user document creation
- ✅ Firebase Firestore integration
- ✅ Google Authentication integration
- ✅ Real-time data loading
- ✅ Responsive mobile-first design
- ✅ Persian/Farsi language support with proper fonts
- ✅ Twilio SMS integration for order notifications
- ✅ Email notification system (ready for production email service)
- ✅ Cross-device settings synchronization via Firebase
- ✅ Enhanced notification content with notes and delivery dates

## 🚀 Ready to Use!

1. **Complete Firebase setup** above
2. **Run**: `npm run dev`
3. **Visit**: http://localhost:3001
4. **Login** with demo credentials or Google Sign-in

Everything works automatically! 🎉 

## 📧 Email Integration Note

For production, you'll need to integrate with an email service provider like:
- **SendGrid**
- **AWS SES** 
- **Resend**
- **Mailgun**

The email API route is ready and will log emails in development mode. 