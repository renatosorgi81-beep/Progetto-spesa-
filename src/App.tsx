import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pantry } from './pages/Pantry';
import { ProductDetail } from './pages/ProductDetail';
import { Expiry } from './pages/Expiry';
import { Recipes } from './pages/Recipes';
import { Family } from './pages/Family';
import { Profile } from './pages/Profile';
import { PRODUCTS } from './data/mockData';
import type { PageName, Product, ProductLocation } from './types';

export default function App() {
  const [page, setPage] = useState<PageName>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pantryFilter, setPantryFilter] = useState<ProductLocation | 'all'>('all');

  const expiryCount = PRODUCTS.filter(
    p => p.status === 'scaduto' || p.status === 'in_scadenza'
  ).length;

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
    >
      {page === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          onNavigateToPantry={handleNavigateToPantry}
          onProductClick={handleProductClick}
        />
      )}
      {page === 'pantry' && (
        <Pantry
          onProductClick={handleProductClick}
          defaultLocationFilter={pantryFilter}
        />
      )}
      {page === 'expiry' && (
        <Expiry onProductClick={handleProductClick} onNavigate={handleNavigate} />
      )}
      {page === 'recipes' && (
        <Recipes />
      )}
      {page === 'family' && (
        <Family />
      )}
      {page === 'profile' && (
        <Profile />
      )}
    </Layout>
  );
}
