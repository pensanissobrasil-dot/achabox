import React, { useState } from 'react';
import { Product } from '../types';
import { X, ExternalLink, Copy, Check, Heart, ShieldCheck, Truck, Star, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(product.storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedOriginalPrice = product.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const totalSavings = (product.originalPrice - product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Image Column */}
            <div className="md:col-span-5 relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                {product.discountPercentage}% OFF
              </span>
              <span className="absolute top-3 right-3 bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded-lg shadow-md">
                {product.store}
              </span>
            </div>

            {/* Details Column */}
            <div className="md:col-span-7 space-y-4">
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <h2 className="text-lg font-black text-slate-900 leading-snug pt-1">
                  {product.title}
                </h2>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  <span>{product.rating}</span>
                </div>
                <span>•</span>
                <span className="text-slate-500">{product.reviewsCount} avaliações positivas</span>
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="text-xs text-slate-500 line-through">
                  Preço Original: {formattedOriginalPrice}
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  Preço do Achadinho: {formattedPrice}
                </div>
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Você economiza {totalSavings} nesta compra!
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-slate-800 block mb-1">Por que é um bom Achadinho?</strong>
                  {product.description}
                </div>
              )}

              {/* Features List */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Frete Grátis Disponível</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Link Direto Oficial</span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <button
              onClick={() => onToggleFavorite(product)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-red-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isFavorite ? 'Salvo nos Favoritos' : 'Salvar Achadinho'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-3 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <a
                href={product.storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <span>IR PARA A LOJA ({product.store})</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
