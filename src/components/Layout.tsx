import React from 'react';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import type { PageName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  page: PageName;
  onNavigate: (page: PageName) => void;
  expiryCount: number;
  onBack?: () => void;
  pageTitle?: string;
}

export function Layout({ children, page, onNavigate, expiryCount, onBack, pageTitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar
        page={page}
        onBack={onBack}
        title={pageTitle}
        onProfile={() => onNavigate('profile')}
        alertCount={expiryCount}
      />
      <main className="flex-1 max-w-lg mx-auto w-full pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav current={page} onChange={onNavigate} expiryCount={expiryCount} />
    </div>
  );
}
