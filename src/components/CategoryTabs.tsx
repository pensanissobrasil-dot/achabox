import React from 'react';
import { CategoryType } from '../types';
import { 
  Sparkles, 
  Shirt, 
  Smartphone, 
  Home, 
  Sparkle, 
  Wrench, 
  Baby, 
  Watch 
} from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const CATEGORIES: { label: CategoryType; icon: React.ReactNode }[] = [
  { label: 'Todos', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Moda', icon: <Shirt className="w-4 h-4" /> },
  { label: 'Eletrônicos', icon: <Smartphone className="w-4 h-4" /> },
  { label: 'Casa', icon: <Home className="w-4 h-4" /> },
  { label: 'Beleza', icon: <Sparkle className="w-4 h-4" /> },
  { label: 'Utilidades', icon: <Wrench className="w-4 h-4" /> },
  { label: 'Infantil', icon: <Baby className="w-4 h-4" /> },
  { label: 'Acessórios', icon: <Watch className="w-4 h-4" /> },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => onSelectCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/60 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
