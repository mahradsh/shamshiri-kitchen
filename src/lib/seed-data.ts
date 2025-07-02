import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Item, Location } from '@/types';

// Original Farsi items list from requirements
const initialItems = [
  'آش',
  'اسفناج',
  'بادمجان',
  'بادمجان کبابی',
  'برنج سفید',
  'تن پرورده',
  'جوجه ران',
  'جوجه سینه',
  'چلوگوشت',
  'خوراک تره',
  'دوغ',
  'زردچوبه',
  'زرشک',
  'سبزی خوردن',
  'سس سالاد',
  'سوپ',
  'غذا',
  'فسنجون',
  'قرمه سبزی',
  'کشک',
  'کشمش',
  'کوفته',
  'گردن',
  'گردوی خرد شده',
  'گوشت کوبیده',
  'ماست',
  'ماست اسفناج',
  'ماست خیار',
  'ماست موسیر',
  'ماهی',
  'همبرگر'
];

export const seedItems = async (): Promise<void> => {
  try {
    console.log('Starting to seed items...');
    
    // Check if items already exist
    const itemsQuery = query(collection(db, 'items'));
    const existingItems = await getDocs(itemsQuery);
    
    if (existingItems.size > 0) {
      console.log('Items already exist, skipping seed...');
      return;
    }

    // Add each item to Firestore
    for (let i = 0; i < initialItems.length; i++) {
      const itemName = initialItems[i];
      const itemData: Omit<Item, 'id'> = {
        name: itemName,
        namePersian: itemName,
        displayOrder: i + 1,
        assignedLocations: ['Both'] as Location[],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate a unique ID for the item
      const itemId = `item_${Date.now()}_${i}`;
      
      await setDoc(doc(db, 'items', itemId), itemData);
      console.log(`Added item: ${itemName}`);
    }

    console.log('Items seeded successfully!');
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
};

// Create a sample admin user
export const createSampleAdmin = async (email: string, password: string, fullName: string): Promise<void> => {
  try {
    // This would be implemented with Firebase Admin SDK or through Firebase Auth
    // For now, just log the instruction
    console.log('To create admin user, use Firebase Console or Admin SDK:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Full Name:', fullName);
    console.log('Role: Admin');
    console.log('Assigned Locations: Both');
    
    // The user document would be created in Firestore after Firebase Auth user creation
    const userData = {
      fullName,
      phoneNumber: '',
      role: 'Admin',
      assignedLocations: ['Both'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('User data for Firestore:', userData);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Create sample staff users
export const createSampleStaff = async (): Promise<void> => {
  try {
    const staffUsers = [
      {
        email: 'staff.northyork@shamshiri.com',
        fullName: 'North York Staff',
        phoneNumber: '+1-416-555-0101',
        assignedLocations: ['North York']
      },
      {
        email: 'staff.thornhill@shamshiri.com',
        fullName: 'Thornhill Staff',
        phoneNumber: '+1-416-555-0102',
        assignedLocations: ['Thornhill']
      },
      {
        email: 'staff.both@shamshiri.com',
        fullName: 'Both Locations Staff',
        phoneNumber: '+1-416-555-0103',
        assignedLocations: ['Both']
      }
    ];

    staffUsers.forEach(user => {
      console.log('Sample staff user:');
      console.log('Email:', user.email);
      console.log('Full Name:', user.fullName);
      console.log('Phone:', user.phoneNumber);
      console.log('Role: Staff');
      console.log('Assigned Locations:', user.assignedLocations);
      console.log('---');
    });
  } catch (error) {
    console.error('Error creating staff users:', error);
    throw error;
  }
};

// Initialize all seed data
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing Shamshiri Kitchen app...');
    
    await seedItems();
    await createSampleAdmin('admin@shamshiri.com', 'admin123456', 'System Administrator');
    await createSampleStaff();
    
    console.log('App initialization complete!');
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }
}; 