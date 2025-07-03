# Shamshiri Kitchen Web App

A web application for Shamshiri Restaurant to manage daily product orders between branches (North York and Thornhill) and the head office.

## Features

### 🔐 Authentication System
- Role-based access control (Admin & Staff)
- Firebase Authentication integration
- Persian language support

### 👨‍💼 Admin Panel
- **Item Management**: Add, edit, delete Persian items with location assignments
- **Order Management**: View, filter, and void orders with detailed information
- **User Management**: Create and manage admin/staff users with location assignments
- **Settings**: Configure email, SMS, and push notification preferences

### 👨‍🍳 Staff Workflow
- **Location Selection**: Choose branch if assigned to multiple locations
- **Calendar Interface**: Select order date
- **Item Selection**: Browse assigned items with quantity controls
- **Order Checkout**: Review and place orders with optional notes

### 🔔 Notifications
- **Email Notifications**: Order placement and void notifications
- **SMS Integration**: Twilio-powered SMS alerts
- **Push Notifications**: Real-time browser notifications

### 📱 PWA Features
- **Standalone Mode**: Full-screen app experience
- **Offline Capability**: Works without internet connection
- **Mobile Responsive**: Optimized for touch devices
- **Persian Font Support**: Vazir font for proper Persian text rendering

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Persian styling
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **SMS**: Twilio
- **PWA**: next-pwa
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Copy your Firebase config and create `.env.local`:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+14165784000

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Firestore Security Rules
Update your Firestore security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read items
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }
    
    // Allow authenticated users to manage orders
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.placedBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
    }
  }
}
\`\`\`

### 4. Create Initial Admin User
1. Use Firebase Console to create a user with email and password
2. Add a document in the \`users\` collection with the user's UID:

\`\`\`json
{
  "fullName": "مدیر سیستم",
  "phoneNumber": "+1-416-555-0100",
  "role": "Admin",
  "assignedLocations": ["Both"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### 5. Initialize Items
Run the app and use the seed function to populate initial Persian items:

\`\`\`bash
npm run dev
\`\`\`

Then in browser console:
\`\`\`javascript
import { initializeApp } from '/src/lib/seed-data.js';
initializeApp();
\`\`\`

### 6. Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## Default Items (Persian)

The app comes with 31 pre-configured Persian food items:
- آش، اسفناج، بادمجان، بادمجان کبابی، برنج سفید
- تن پرورده، جوجه ران، جوجه سینه، چلوگوشت، خوراک تره
- دوغ، زردچوبه، زرشک، سبزی خوردن، سس سالاد
- سوپ، غذا، فسنجون، قرمه سبزی، کشک
- کشمش، کوفته، گردن، گردوی خرد شده، گوشت کوبیده
- ماست، ماست اسفناج، ماست خیار، ماست موسیر، ماهی، همبرگر

## Twilio SMS Configuration

The app uses Twilio for SMS notifications. Configure your credentials in the environment variables:
- **Phone Number**: +1 416-578-4000
- **Account SID**: [Set in environment variables]
- **Auth Token**: [Set in environment variables]

## Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Start Production Server
\`\`\`bash
npm run start
\`\`\`

## Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin panel pages
│   ├── staff/          # Staff panel pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Login page
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
│   ├── auth-context.tsx # Authentication context
│   ├── firebase.ts     # Firebase configuration
│   └── seed-data.ts    # Database seeding
└── types/             # TypeScript type definitions
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2024 آشپزخانه شمشیری - All rights reserved 