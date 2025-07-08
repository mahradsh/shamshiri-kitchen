// Helper script to show the user accounts that need to be created in Firebase Console
// Run this with: node scripts/create-users.js

console.log('🔥 FIREBASE AUTHENTICATION SETUP');
console.log('==================================\n');

console.log('Go to Firebase Console > Authentication > Users and create these accounts:\n');

const users = [
  {
    type: 'Admin',
    email: 'admin@shamshiri.com',
    password: 'admin123',
    access: 'Full admin access - can manage items, view all orders, void orders'
  },
  {
    type: 'North York Staff',
    email: 'northyork@shamshiri.com',
    password: 'staff123',
    access: 'Can only see and order North York items'
  },
  {
    type: 'Thornhill Staff', 
    email: 'thornhill@shamshiri.com',
    password: 'thornhill456',
    access: 'Can only see and order Thornhill items'
  },
  {
    type: 'Store Manager',
    email: 'manager@shamshiri.com', 
    password: 'manager789',
    access: 'Can access both North York and Thornhill'
  }
];

users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.type}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Access: ${user.access}`);
  console.log('');
});

console.log('📋 STEPS:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your "kitchen-shamshiri" project');
console.log('3. Go to Authentication > Users');
console.log('4. Click "Add user" for each account above');
console.log('5. Enter the email and password exactly as shown');
console.log('6. Test login at your app URL\n');

console.log('✅ The app will automatically create user documents with correct location assignments!');
console.log('✅ Google Sign-in has been completely removed - only email/password now!');
console.log('✅ Admin can edit items and void orders, staff cannot void orders!'); 