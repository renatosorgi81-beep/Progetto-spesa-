import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pantry } from './pages/Pantry';
import { ProductDetail } from './pages/ProductDetail';
import { Expiry } from './pages/Expiry';
import { Recipes } from './pages/Recipes';
import { Impact } from './pages/Impact';
import { Profile } from './pages/Profile';
import { ShoppingList } from './pages/ShoppingList';
import { PRODUCTS, INITIAL_SHOPPING_ITEMS } from './data/mockData';
import type { PageName, Product, ProductLocation, ShoppingItem } from './types';

export default function App() {
  const [page, setPage] = useState<PageName>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pantryFilter, setPantryFilter] = useState<ProductLocation | 'all'>('all');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(INITIAL_SHOPPING_ITEMS);

  const expiryCount = PRODUCTS.filter(
    p => p.status === 'scaduto' || p.status === 'in_scadenza'
  ).length;

  const cartCount = shoppingItems.filter(i => !i.purchased).length;

  function handleAddShoppingItem(item: Omit<ShoppingItem, 'id' | 'addedAt' | 'purchased'>) {
    const newItem: ShoppingItem = {
      ...item,
      id: `s${Date.now()}`,
      addedAt: new Date().toISOString(),
      purchased: false,
    };
    setShoppingItems(prev => [newItem, ...prev]);
  }

  function handleToggleShoppingItem(id: string) {
    setShoppingItems(prev =>
      prev.map(i => (i.id === id ? { ...i, purchased: !i.purchased } : i))
    );
  }

  function handleDeleteShoppingItem(id: string) {
    setShoppingItems(prev => prev.filter(i => i.id !== id));
  }

  function handleProductClick(product: Product) {
    setSelectedProduct(product);
  }

  function handleBack() {
    setSelectedProduct(null);
  }

  function handleNavigate(newPage: PageName) {
    setSelectedProduct(null);
    if (newPage !== 'pantry') setPantryFilter('all');
    setPage(newPage);
  }

  function handleNavigateToPantry(filter: ProductLocation | 'all' = 'all') {
    setSelectedProduct(null);
    setPantryFilter(filter);
    setPage('pantry');
  }

  if (selectedProduct) {
    return (
      <Layout
        page={page}
        onNavigate={handleNavigate}
        expiryCount={expiryCount}
        onBack={handleBack}
        pageTitle={selectedProduct.name}
        cartCount={cartCount}
        onCartClick={() => handleNavigate('spesa')}
      >
        <ProductDetail
          product={selectedProduct}
          onBack={handleBack}
          onNavigate={handleNavigate}
          onGoToPantry={() => handleNavigateToPantry('all')}
        />
      </Layout>
    );
  }

  return (
    <Layout
      page={page}
      onNavigate={handleNavigate}
      expiryCount={expiryCount}
      cartCount={cartCount}
      onCartClick={() => handleNavigate('spesa')}
    >
      {page === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          onNavigateToPantry={handleNavigateToPantry}
          onProductClick={handleProductClick}
        />
      )}
      {page === 'pantry' && (
        <Pantry onProductClick={handleProductClick} defaultLocationFilter={pantryFilter} />
      )}
      {page === 'expiry' && (
        <Expiry onProductClick={handleProductClick} onNavigate={handleNavigate} />
      )}
      {page === 'recipes' && <Recipes />}
      {page === 'impatto' && <Impact onNavigate={handleNavigate} />}
      {page === 'spesa' && (
        <ShoppingList
          items={shoppingItems}
          onToggle={handleToggleShoppingItem}
          onDelete={handleDeleteShoppingItem}
          onAdd={handleAddShoppingItem}
        />
      )}
      {page === 'profile' && <Profile />}
    </Layout>
  );
}
