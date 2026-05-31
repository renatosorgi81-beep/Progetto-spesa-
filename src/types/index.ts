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
  purchaseDate: string;
  expiryDate: string;
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
  servings: number;
  tags: string[];
  isUrgent: boolean;
  steps: string[];
  tip?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  emoji: string;
  category: ProductCategory;
  qty: string;
  addedBy: string;
  addedAt: string;
  purchased: boolean;
  note?: string;
}

export interface Purchase {
  id: string;
  date: string;
  store: string;
  itemCount: number;
  total: number;
  products: string[];
}

export interface ConsumptionRecord {
  id: string;
  productId: string;
  productName: string;
  productEmoji: string;
  category: ProductCategory;
  date: string;
  qtyConsumed: number;
  unit: string;
  wasWasted: boolean;
  valueEuros: number;
  consumedByMember: string;
}

export interface MonthlyImpact {
  month: string;
  shortMonth: string;
  consumed: number;
  wasted: number;
  kgSaved: number;
  eurosSaved: number;
  co2Kg: number;
}

export interface ImpactBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

export type PageName = 'dashboard' | 'pantry' | 'expiry' | 'recipes' | 'impatto' | 'spesa' | 'profile';
