export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'Admin' | 'Staff';
  assignedLocations: Location[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  namePersian: string;
  displayOrder: number;
  assignedLocations: Location[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: Date;
  location: Location;
  placedBy: string; // User ID
  placedByName: string;
  items: OrderItem[];
  staffNote?: string;
  status: 'Active' | 'Voided';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  itemNamePersian: string;
  quantity: number;
}

export type Location = 'North York' | 'Thornhill' | 'Both';

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  phoneNumbers: string[];
  emailAddresses: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  location: Location;
  orderDate: Date;
  staffNote?: string;
} 