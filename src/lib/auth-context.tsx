'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, AuthContextType } from '@/types';
import { seedItems } from './seed-data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auto-create admin user document if it doesn't exist
const createAdminUser = async (firebaseUser: FirebaseUser) => {
  const userData = {
    fullName: "System Administrator",
    phoneNumber: "",
    role: "Admin",
    assignedLocations: ["Both"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  console.log('Admin user document created automatically');
  
  // Also seed items on first admin login
  try {
    await seedItems();
    console.log('Items seeded automatically on admin login');
  } catch (error) {
    console.log('Items already exist or seeding failed:', error);
  }

  return userData;
};

// Auto-create staff user document if it doesn't exist
const createStaffUser = async (firebaseUser: FirebaseUser) => {
  let userData;
  
  // Define specific staff accounts with their location assignments
  switch (firebaseUser.email) {
    case 'northyork@shamshiri.com':
      userData = {
        fullName: "North York Staff",
        phoneNumber: "",
        role: "Staff",
        assignedLocations: ["North York"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      break;
      
    case 'thornhill@shamshiri.com':
      userData = {
        fullName: "Thornhill Staff",
        phoneNumber: "",
        role: "Staff",
        assignedLocations: ["Thornhill"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      break;
      
    case 'manager@shamshiri.com':
      userData = {
        fullName: "Store Manager",
        phoneNumber: "",
        role: "Staff",
        assignedLocations: ["Both"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      break;
      
    default:
      // Fallback for any other staff emails
      userData = {
        fullName: "Staff User",
        phoneNumber: "",
        role: "Staff",
        assignedLocations: ["Both"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  console.log('Staff user document created automatically for:', firebaseUser.email);

  return userData;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get user data from Firestore
        let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData;

        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          // Auto-create user document if it doesn't exist
          if (firebaseUser.email === 'admin@shamshiri.com') {
            userData = await createAdminUser(firebaseUser);
          } else {
            // All other emails are treated as staff
            userData = await createStaffUser(firebaseUser);
          }
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          assignedLocations: userData.assignedLocations,
          isActive: userData.isActive,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, userData: Partial<User>) => {
    // This would be implemented later for admin user creation
    throw new Error('Signup not implemented - users must be created by admin');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 