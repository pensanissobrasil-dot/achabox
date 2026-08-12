import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Settings, Plus, X, User, ShieldCheck } from 'lucide-react';
import { SiteConfig } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  config: SiteConfig;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenAddModal: () => void;
  onOpenEditSiteModal: () => void;
  onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  searchQuery,
  onSearchChange,
  favoritesCount,
  onOpenFavorites,
  onOpenAddModal,
  onOpenEditSiteModal,
  onOpenAdminPanel,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        onOpenAdminPanel();
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClicks(0), 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo Section - achabox Branding */}
          <div className="flex items-center shrink-0">
            <Logo size="md" onClick={handleLogoClick} />
          </div>

          {/* Search Bar - Matching the center pill search bar in the screenshot */}
          <div className="flex-1 max-w-xl mx-2">
            <div className={`relative transition-all duration-200 rounded-full border ${isSearchFocused ? 'border-purple-600 ring-3 ring-purple-100 shadow-md' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Buscar achadinhos, produtos, marcas..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-transparent text-slate-900 placeholder-slate-400 rounded-full focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Header Action Icons - Profile, Favorites, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Profile Icon */}
            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" title="Sua Conta">
              <User className="w-5 h-5" />
            </div>

            {/* Favorites Icon */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver Achadinhos Salvos"
            >
              <Heart className="w-5 h-5 text-slate-700 hover:text-red-500 transition-colors" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart / Bag Icon */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sacola de Descontos"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              <span className="absolute -top-0.5 -right-0.5 bg-purple-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount || 2}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
