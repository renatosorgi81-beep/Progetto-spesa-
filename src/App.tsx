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
import { ReceiptScanner } from './components/ReceiptScanner';
import { PRODUCTS, INITIAL_SHOPPING_ITEMS } from './data/mockData';
import type { PageName, Product, ProductLocation, ShoppingItem } from './types';

export default function App() {
  const [page, setPage] = useState<PageName>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pantryFilter, setPantryFilter] = useState<ProductLocation | 'all'>('all');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(INITIAL_SHOPPING_ITEMS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [showScanner, setShowScanner] = useState(false);

  const expiryCount = products.filter(
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

  function handleUpdateProduct(updated: Product) {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProduct(updated);
  }

  function handleAddScannedProducts(newProducts: Product[]) {
    setProducts(prev => [...newProducts, ...prev]);
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
      <>
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
            onUpdateProduct={handleUpdateProduct}
          />
        </Layout>
        {showScanner && (
          <ReceiptScanner
            onAddProducts={handleAddScannedProducts}
            onClose={() => setShowScanner(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
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
            products={products}
          />
        )}
        {page === 'pantry' && (
          <Pantry
            onProductClick={handleProductClick}
            defaultLocationFilter={pantryFilter}
            products={products}
            onOpenScanner={() => setShowScanner(true)}
          />
        )}
        {page === 'expiry' && (
          <Expiry onProductClick={handleProductClick} onNavigate={handleNavigate} products={products} />
        )}
        {page === 'recipes' && <Recipes products={products} />}
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
      {showScanner && (
        <ReceiptScanner
          onAddProducts={handleAddScannedProducts}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
