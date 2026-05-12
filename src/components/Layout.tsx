/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, Settings as SettingsIcon, LayoutDashboard, ShoppingCart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'settings') => void;
  currentView: string;
}

export default function Layout({ children, onLogout, onNavigate, currentView }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <ShoppingCart className="h-6 w-6 text-orange-600 mr-2" />
                <span className="font-bold text-xl tracking-tight">WooManager</span>
              </div>
              <div className="hidden sm:flex space-x-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    currentView === 'dashboard' ? 'text-orange-600 bg-orange-50' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  ড্যাশবোর্ড
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    currentView === 'settings' ? 'text-orange-600 bg-orange-50' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <SettingsIcon className="h-4 w-4 mr-1.5" />
                  সেটিং
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
