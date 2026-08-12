import React from 'react';
import { Product } from '../types';
import { X, Trash2, ExternalLink, Heart, Sparkles, ShoppingBag } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const totalSaved = favorites.reduce(
    (acc, item) => acc + (item.originalPrice - item.price),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-400 text-red-400" />
              <div>
                <h2 className="text-lg font-black tracking-tight">Achadinhos Salvos</h2>
                <p className="text-xs text-purple-200">
                  {favorites.length} {favorites.length === 1 ? 'item salvo' : 'itens salvos'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Savings Callout */}
          {favorites.length > 0 && (
            <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900">
                  Economia total dos seus salvos:
                </span>
              </div>
              <span className="text-sm font-black text-emerald-700">
                {totalSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-700 text-sm">Nenhum achadinho salvo ainda</p>
                <p className="text-xs max-w-xs">
                  Clique no ícone de coração nos cards para guardar suas ofertas favoritas aqui!
                </p>
              </div>
            ) : (
              favorites.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex gap-3 items-center group cursor-pointer"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-red-600 text-white font-bold text-[9px] px-1 rounded">
                      -{product.discountPercentage}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {product.store}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {product.title}
                    </h4>
                    <div className="text-xs font-black text-emerald-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <a
                      href={product.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-purple-700 text-white hover:bg-purple-800 rounded-lg transition-colors"
                      title="Ir para a loja"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(product);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-medium">
            Seus salvos ficam gravados no seu navegador!
          </div>

        </div>
      </div>
    </div>
  );
};
