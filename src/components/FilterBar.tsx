import React from 'react';
import { StoreType } from '../types';
import { Filter, Flame, ArrowDownUp, ShieldCheck } from 'lucide-react';

interface FilterBarProps {
  selectedStore: StoreType;
  onSelectStore: (store: StoreType) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  productsCount: number;
  onlyHotDeals: boolean;
  onToggleHotDeals: () => void;
}

const STORES: { name: StoreType; color: string; badgeBg: string }[] = [
  { name: 'Todos', color: 'bg-slate-900 text-white', badgeBg: 'bg-slate-100' },
  { name: 'Shopee', color: 'bg-orange-500 text-white', badgeBg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Amazon', color: 'bg-slate-900 text-amber-400', badgeBg: 'bg-amber-50 text-slate-900 border-amber-300' },
  { name: 'Mercado Livre', color: 'bg-yellow-400 text-blue-950 font-bold', badgeBg: 'bg-yellow-50 text-blue-900 border-yellow-300' },
  { name: 'Shein', color: 'bg-black text-white', badgeBg: 'bg-slate-50 text-slate-900 border-slate-300' },
  { name: 'Magalu', color: 'bg-blue-600 text-white', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedStore,
  onSelectStore,
  sortBy,
  onSortChange,
  productsCount,
  onlyHotDeals,
  onToggleHotDeals,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Stores Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none no-scrollbar">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Lojas:
          </span>
          {STORES.map((store) => {
            const isActive = selectedStore === store.name;
            return (
              <button
                key={store.name}
                onClick={() => onSelectStore(store.name)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? `${store.color} shadow-sm scale-105 border-transparent`
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {store.name}
              </button>
            );
          })}
        </div>

        {/* Right Side Options: Hot deals filter & Sorting */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          
          {/* Super Ofertas Toggle */}
          <button
            onClick={onToggleHotDeals}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              onlyHotDeals
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyHotDeals ? 'text-yellow-300' : 'text-red-500'}`} />
            <span>Super Ofertas</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="relevancia">Mais Relevantes</option>
              <option value="desconto">Maior Desconto (%)</option>
              <option value="menor-preco">Menor Preço (R$)</option>
              <option value="maior-preco">Maior Preço (R$)</option>
              <option value="avaliacoes">Melhores Avaliados</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            <strong className="text-slate-800 font-bold">{productsCount}</strong> achadinhos
          </span>

        </div>

      </div>
    </div>
  );
};
