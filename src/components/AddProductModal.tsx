import React, { useState } from 'react';
import { Product, CategoryType, StoreType, AffiliateConfig } from '../types';
import { X, Plus, Sparkles, Link as LinkIcon, Image as ImageIcon, Zap, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractProductInfo } from '../utils/extractor';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Auto extraction states
  const [autoUrl, setAutoUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Manual form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [store, setStore] = useState<Exclude<StoreType, 'Todos'>>('Shopee');
  const [storeUrl, setStoreUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<CategoryType>('Eletrônicos');
  const [badge, setBadge] = useState('🔥 ACHADINHO VIP');
  const [isHotDeal, setIsHotDeal] = useState(true);
  const [freteGratis, setFreteGratis] = useState(true);

  if (!isOpen) return null;

  // Read saved affiliate tags
  const getAffiliateConfig = (): AffiliateConfig => {
    const saved = localStorage.getItem('achadinhos_affiliate_config');
    return saved ? JSON.parse(saved) : {};
  };

  // Handle Auto Extraction via Extractor Utility
  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoUrl.trim()) return;

    setIsExtracting(true);
    setExtractError(null);

    try {
      const affiliateConfig = getAffiliateConfig();
      const p = await extractProductInfo(autoUrl, affiliateConfig);

      if (!p || !p.title) {
        throw new Error('Não foi possível extrair os dados do link fornecido.');
      }

      setTitle(p.title || '');
      setDescription(p.description || '');
      setPrice(String(p.price || ''));
      setOriginalPrice(String(p.originalPrice || ''));
      setStore((p.store as Exclude<StoreType, 'Todos'>) || 'Shopee');
      setStoreUrl(p.storeUrl || autoUrl);
      setImageUrl(p.imageUrl || '');
      setCategory((p.category as CategoryType) || 'Eletrônicos');
      setBadge(p.badge || '🔥 ACHADINHO VIP');
      setIsHotDeal(p.isHotDeal ?? true);
      setFreteGratis(p.freteGratis ?? true);

      // Switch to manual mode with prefilled values
      setMode('manual');
    } catch (err: any) {
      console.error(err);
      setExtractError(err?.message || 'Erro ao extrair informações do link. Tente o modo manual.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedOriginalPrice = parseFloat(originalPrice.replace(',', '.')) || parsedPrice * 1.5;

    const discountPercentage = Math.round(
      ((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100
    );

    onAddProduct({
      title: title || 'Novo Achadinho Recomendado',
      description,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      discountPercentage: discountPercentage > 0 ? discountPercentage : 40,
      store,
      storeUrl: storeUrl || 'https://shopee.com.br',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      category: category === 'Todos' ? 'Utilidades' : category,
      rating: 4.9,
      reviewsCount: Math.floor(Math.random() * 500) + 100,
      badge,
      isHotDeal,
      freteGratis,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setStoreUrl('');
    setImageUrl('');
    setAutoUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400 text-purple-950 rounded-xl">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Cadastrar Novo Achadinho</h2>
              <p className="text-xs text-purple-200">Insira o link para importar dados automaticamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              mode === 'auto'
                ? 'bg-white text-purple-800 border-b-2 border-purple-700 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>1. Extrair por Link (IA)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-purple-800 border-b-2 border-purple-700 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>2. Formulário / Ajustar Campos</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="overflow-y-auto p-6 text-xs font-semibold text-slate-700">
          
          {/* AUTO MODE */}
          {mode === 'auto' && (
            <form onSubmit={handleExtract} className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 space-y-1">
                <p className="font-extrabold text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Preenchimento Automático por Link
                </p>
                <p className="text-[11px] text-purple-800 font-normal">
                  Cole o link da Shopee, Amazon, Mercado Livre, Shein ou Magalu. Nossa IA preencherá as informações e incluirá seu link de afiliado!
                </p>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                  Link do Produto no Marketplace *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://shopee.com.br/produto... ou https://amzn.to/..."
                  value={autoUrl}
                  onChange={(e) => setAutoUrl(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-medium text-sm"
                />
              </div>

              {extractError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{extractError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="px-4 py-2.5 text-slate-600 font-bold hover:text-slate-800"
                >
                  Ir direto para Manual
                </button>
                <button
                  type="submit"
                  disabled={isExtracting || !autoUrl.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                      <span>Extraindo Informações...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>EXTRAIR DADOS COM IA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MANUAL FORM MODE */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">Título do Produto / Achadinho *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Liquidificador 1200W Inox Jarra de Vidro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal text-sm"
                />
              </div>

              {/* Store & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Loja *</label>
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value as Exclude<StoreType, 'Todos'>)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-semibold"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shein">Shein</option>
                    <option value="Magalu">Magalu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-semibold"
                  >
                    <option value="Moda">Moda</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Casa">Casa</option>
                    <option value="Beleza">Beleza</option>
                    <option value="Utilidades">Utilidades</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Preço com Desconto (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 49.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Preço Original (R$)</label>
                  <input
                    type="text"
                    placeholder="Ex: 99.90"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 text-slate-500 line-through"
                  />
                </div>
              </div>

              {/* Links: Store Affiliate URL & Image URL */}
              <div>
                <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                  Link do Produto (Seu Link de Afiliado) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://shopee.com.br/item-exemplo"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal text-xs font-mono text-purple-900"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  Link da Imagem do Produto
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">Dica ou Descrição Curta</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Produto excelente, super durável e entrega muito rápida!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal"
                />
              </div>

              {/* Badges & Checkboxes */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">Selo / Tag Destaque</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: 🔥 50% OFF, BOMBANDO NO TIKTOK"
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-semibold text-purple-900"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isHotDeal}
                      onChange={(e) => setIsHotDeal(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span>Super Oferta em Destaque</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={freteGratis}
                      onChange={(e) => setFreteGratis(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span>Frete Grátis</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>PUBLICAR ACHADINHO</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
