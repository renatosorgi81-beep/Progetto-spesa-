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
import type { PageName, Product } from './types';

export default function App() {
  const [page, setPage] = useState<PageName>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Alert count: scaduti + in_scadenza
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
    setPage(newPage);
  }

  // Product detail view (overlays any page)
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
        <Dashboard onNavigate={handleNavigate} onProductClick={handleProductClick} />
      )}
      {page === 'pantry' && (
        <Pantry onProductClick={handleProductClick} />
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
