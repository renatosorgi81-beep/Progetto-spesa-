export type ProductLocation = 'frigo' | 'dispensa' | 'freezer';
export type ProductStatus = 'ok' | 'in_scadenza' | 'scaduto' | 'quasi_finito';
export type ProductCategory =
  | 'latticini'
  | 'carne'
  | 'pesce'
  | 'verdura'
  | 'frutta'
  | 'pane'
  | 'pasta_riso'
  | 'conserve'
  | 'bevande'
  | 'dolci'
  | 'surgelati'
  | 'salumi'
  | 'condimenti';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  imageEmoji: string;
  location: ProductLocation;
  purchasedQty: number;
  remainingQty: number;
  unit: string;
  format: string;
  purchaseDate: string;     // ISO date string
  expiryDate: string;       // ISO date string
  lot: string;
  notes: string;
  price: number;
  status: ProductStatus;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  lastActivity: string;
  activityDescription: string;
}

export interface Recipe {
  id: string;
  name: string;
  imageEmoji: string;
  description: string;
  totalIngredients: number;
  availableIngredients: number;
  missingIngredients: string[];
  requiredProductIds: string[];
  difficulty: 'facile' | 'media' | 'difficile';
  time: string;
  tags: string[];
  isUrgent: boolean; // prioritized because ingredients expire soon
}

export interface Purchase {
  id: string;
  date: string;
  store: string;
  itemCount: number;
  total: number;
  products: string[]; // product ids
}

export type PageName = 'dashboard' | 'pantry' | 'expiry' | 'recipes' | 'family' | 'profile';
