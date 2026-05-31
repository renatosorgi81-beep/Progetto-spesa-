export type ProductLocation = 'frigo' | 'dispensa' | 'freezer';
export type ProductStatus = 'ok' | 'in_scadenza' | 'scaduto';

export interface Product {
  id: string;
  name: string;
  emoji: string;
  location: ProductLocation;
  expiryDate: string; // YYYY-MM-DD
  qty: number;
  unit: string;
  price?: number;
  addedAt: string;
  status: ProductStatus;
}

export interface ShoppingItem {
  id: string;
  name: string;
  emoji: string;
  qty: string;
  purchased: boolean;
  addedAt: string;
}

export type PageName = 'dispensa' | 'scadenze' | 'spesa';
