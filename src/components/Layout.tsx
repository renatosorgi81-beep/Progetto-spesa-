import React from 'react';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import type { PageName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  page: PageName;
  onNavigate: (p: PageName) => void;
  expiryUrgent?: number;
  cartPending?: number;
}

export function Layout({ children, page, onNavigate, expiryUrgent, cartPending }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      <TopBar page={page} />
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav current={page} onChange={onNavigate} expiryUrgent={expiryUrgent} cartPending={cartPending} />
    </div>
  );
}
