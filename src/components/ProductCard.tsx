import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, ExternalLink, Copy, Check, Star, Truck, Flame, Share2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

const STORE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  Shopee: { bg: 'bg-orange-500', text: 'text-white', label: 'Shopee' },
  Amazon: { bg: 'bg-slate-900', text: 'text-amber-400', label: 'Amazon' },
  'Mercado Livre': { bg: 'bg-yellow-400', text: 'text-blue-950 font-bold', label: 'Mercado Livre' },
  Shein: { bg: 'bg-black', text: 'text-white', label: 'Shein' },
  Magalu: { bg: 'bg-blue-600', text: 'text-white', label: 'Magalu' },
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
}) => {
  const [copied, setCopied] = useState(false);

  const storeInfo = STORE_BADGES[product.store] || { bg: 'bg-slate-800', text: 'text-white', label: product.store };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedOriginalPrice = product.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const savings = (product.originalPrice - product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* Top Badges overlay on image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        
        {/* Discount Badge - Matching red badge on reference image */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wide flex items-center gap-1">
            <Flame className="w-3 h-3 text-yellow-300" />
            {product.discountPercentage}% OFF
          </span>
          {product.badge && (
            <span className="bg-purple-900/90 text-yellow-300 backdrop-blur-xs font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Store Tag Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`${storeInfo.bg} ${storeInfo.text} font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-md`}>
            {storeInfo.label}
          </span>
        </div>

        {/* Product Image with Zoom on hover */}
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
          title={isFavorite ? 'Remover dos salvos' : 'Salvar achadinho'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600 hover:text-red-500'}`} />
        </button>

        {/* Frete Grátis Badge */}
        {product.freteGratis && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Frete Grátis</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Store + Rating row */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price Box */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 line-through font-medium">
              De {formattedOriginalPrice}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              - {savings}
            </span>
          </div>
          <div className="text-xl font-black text-emerald-600 tracking-tight">
            Por {formattedPrice}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          <a
            href={product.storeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="col-span-9 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer text-center"
          >
            <span>VER NA LOJA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopyLink}
            className={`col-span-3 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Copiar link do produto"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
