import React, { useState, useEffect } from 'react';
import { Product, CategoryType, StoreType, AffiliateConfig, SiteConfig } from '../types';
import { 
  X, Sparkles, Link as LinkIcon, ShoppingBag, ShieldCheck, 
  Trash2, Edit3, CheckCircle2, Zap, Settings, RefreshCw, 
  Plus, ExternalLink, ArrowRight, Tag, AlertCircle, Copy, BarChart3, Flame,
  MessageCircle, Send, Ticket
} from 'lucide-react';
import { extractProductInfo, generateAutoDeals } from '../utils/extractor';
import { INITIAL_SITE_CONFIG } from '../data/mockData';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
  siteConfig?: SiteConfig;
  onSaveConfig?: (newConfig: SiteConfig) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  siteConfig,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'generator' | 'affiliates' | 'config' | 'manage'>('auto');

  // Site Config state
  const [localSiteConfig, setLocalSiteConfig] = useState<SiteConfig>(() => {
    if (siteConfig) return siteConfig;
    const saved = localStorage.getItem('achadinhos_site_config');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
  });

  const [siteConfigSavedNotice, setSiteConfigSavedNotice] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setLocalSiteConfig(siteConfig);
    }
  }, [siteConfig]);

  // Affiliate Config state
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(() => {
    const saved = localStorage.getItem('achadinhos_affiliate_config');
    return saved ? JSON.parse(saved) : {
      shopeeTag: 'achadinhos_vip',
      amazonTag: 'achadinhosvip-20',
      mercadoLivreTag: 'matt_tool=123456',
      sheinTag: 'aff_shein_vip',
      magaluTag: 'achadinhosmagalu',
    };
  });

  const [savedConfigNotice, setSavedConfigNotice] = useState(false);

  // Auto Extraction State
  const [productUrl, setProductUrl] = useState('');
  const [overrideStore, setOverrideStore] = useState<StoreType>('Todos');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<Omit<Product, 'id' | 'createdAt'> | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Auto Generator State
  const [genStore, setGenStore] = useState<Exclude<StoreType, 'Todos'>>('Shopee');
  const [genCategory, setGenCategory] = useState<CategoryType>('Eletrônicos');
  const [genCount, setGenCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<Product[]>([]);

  // Product Editing State in Management tab
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('achadinhos_affiliate_config', JSON.stringify(affiliateConfig));
  }, [affiliateConfig]);

  if (!isOpen) return null;

  // Handle URL Extraction
  const handleExtractProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedPreview(null);
    setPublishedSuccess(false);

    try {
      const product = await extractProductInfo(productUrl, affiliateConfig, overrideStore);
      if (!product || !product.title) {
        throw new Error('Não foi possível extrair os dados do link. Verifique a URL.');
      }
      setExtractedPreview(product as Omit<Product, 'id' | 'createdAt'>);
    } catch (err: any) {
      console.error(err);
      setExtractionError(err?.message || 'Falha ao buscar dados do link. Verifique a URL e tente novamente.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm Extracted Product
  const handleConfirmAddExtracted = () => {
    if (!extractedPreview) return;
    onAddProduct(extractedPreview as Omit<Product, 'id' | 'createdAt'>);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setExtractedPreview(null);
      setProductUrl('');
    }, 2000);
  };

  // Handle AI Bulk Generation
  const handleGenerateDeals = async () => {
    setIsGenerating(true);
    try {
      const deals = await generateAutoDeals(genStore, genCategory, genCount, affiliateConfig);
      if (Array.isArray(deals) && deals.length > 0) {
        setGeneratedProducts(deals as Omit<Product, 'id' | 'createdAt'>[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add all generated products
  const handleAddAllGenerated = () => {
    generatedProducts.forEach((prod) => {
      const { id, createdAt, ...rest } = prod;
      onAddProduct(rest);
    });
    setGeneratedProducts([]);
    setActiveTab('manage');
  };

  // Save Affiliate Tags
  const handleSaveAffiliateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('achadinhos_affiliate_config', JSON.stringify(affiliateConfig));
    setSavedConfigNotice(true);
    setTimeout(() => setSavedConfigNotice(false), 2500);
  };

  // Save Site Config (Cupom, WhatsApp, Telegram, Announcement)
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('achadinhos_site_config', JSON.stringify(localSiteConfig));
    if (onSaveConfig) {
      onSaveConfig(localSiteConfig);
    }
    setSiteConfigSavedNotice(true);
    setTimeout(() => setSiteConfigSavedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Painel Administrativo</h2>
                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SISTEMA AUTOMÁTICO DE AFILIADOS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Cadastre achadinhos automaticamente via link, configure seus códigos de afiliado e gerencie ofertas.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'auto'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Cadastrar por Link (IA)</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gerador em Massa (IA)</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'affiliates'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Tags de Afiliado</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>Configurações (Cupom / Zap / Telegram)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span>Gerenciar Ofertas ({products.length})</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

          {/* TAB 1: CADASTRO AUTOMÁTICO POR LINK */}
          {activeTab === 'auto' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Info banner */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5 text-white shadow-lg flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl shrink-0">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm mb-1">Como funciona a extração automática?</h3>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    Copie a URL de qualquer oferta na <strong>Shopee, Amazon, Mercado Livre, Shein ou Magalu</strong> e cole abaixo. 
                    Nossa inteligência artificial analisa a página, extrai o título, preço, desconto, fotos e anexa automaticamente o seu <strong>link de afiliado</strong>!
                  </p>
                </div>
              </div>

              {/* URL Input Form */}
              <form onSubmit={handleExtractProduct} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-slate-800 font-bold text-xs mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-purple-600" />
                      Cole o Link do Produto / Marketplace *
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Aceita Shopee, Amazon, Mercado Livre, Shein, Magalu</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Cole o link (ex: https://shp.ee/...) ou o texto da oferta com o link"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 text-sm font-medium"
                    />

                    <select
                      value={overrideStore}
                      onChange={(e) => setOverrideStore(e.target.value as StoreType)}
                      className="px-3 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
                    >
                      <option value="Todos">Auto-Detectar Loja</option>
                      <option value="Shopee">Shopee</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Mercado Livre">Mercado Livre</option>
                      <option value="Shein">Shein</option>
                      <option value="Magalu">Magalu</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isExtracting || !productUrl.trim()}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isExtracting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                          <span>Extraindo com IA...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span>EXTRAIR DADOS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Example Quick Paste Badges */}
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-400 text-[11px]">Exemplos para testar:</span>
                  <button
                    type="button"
                    onClick={() => setProductUrl('https://shopee.com.br/item-exemplo-fone-bluetooth-f9-5c')}
                    className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-[11px] font-semibold border border-orange-200 cursor-pointer"
                  >
                    + Exemplo Shopee
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductUrl('https://amazon.com.br/dp/B08N5WRWNW-echo-dot-4a-geracao')}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[11px] font-semibold border border-amber-200 cursor-pointer"
                  >
                    + Exemplo Amazon
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductUrl('https://produto.mercadolivre.com.br/MLB-33829102-air-fryer-inox')}
                    className="px-2.5 py-1 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 rounded-lg text-[11px] font-semibold border border-yellow-200 cursor-pointer"
                  >
                    + Exemplo Mercado Livre
                  </button>
                </div>
              </form>

              {/* Extraction Error */}
              {extractionError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{extractionError}</span>
                </div>
              )}

              {/* Success Notification */}
              {publishedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Achadinho cadastrado com sucesso e já está visível na página principal!</span>
                </div>
              )}

              {/* Extracted Product Preview Card */}
              {extractedPreview && (
                <div className="bg-white rounded-3xl border-2 border-purple-600/30 p-6 shadow-xl space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="font-black text-slate-900 text-sm">Pré-visualização do Achadinho Extraído</h4>
                    </div>
                    <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-bold border border-purple-200">
                      Link de Afiliado Processado ✅
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Image Column */}
                    <div className="space-y-3">
                      <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                        <img
                          src={extractedPreview.imageUrl}
                          alt={extractedPreview.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                          -{extractedPreview.discountPercentage}% OFF
                        </span>
                        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {extractedPreview.store}
                        </span>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold text-[11px] mb-1">URL da Imagem</label>
                        <input
                          type="url"
                          value={extractedPreview.imageUrl}
                          onChange={(e) => setExtractedPreview({ ...extractedPreview, imageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-normal"
                        />
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="md:col-span-2 space-y-3 text-xs font-semibold">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">Título do Produto</label>
                        <input
                          type="text"
                          value={extractedPreview.title}
                          onChange={(e) => setExtractedPreview({ ...extractedPreview, title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-purple-600"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1">Preço com Desconto (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={extractedPreview.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const disc = Math.round(((extractedPreview.originalPrice - val) / extractedPreview.originalPrice) * 100);
                              setExtractedPreview({ 
                                ...extractedPreview, 
                                price: val,
                                discountPercentage: disc > 0 ? disc : 0
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-emerald-700 bg-emerald-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">Preço Original (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={extractedPreview.originalPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const disc = Math.round(((val - extractedPreview.price) / val) * 100);
                              setExtractedPreview({ 
                                ...extractedPreview, 
                                originalPrice: val,
                                discountPercentage: disc > 0 ? disc : 0 
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-500 bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">Loja</label>
                          <select
                            value={extractedPreview.store}
                            onChange={(e) => setExtractedPreview({ ...extractedPreview, store: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50"
                          >
                            <option value="Shopee">Shopee</option>
                            <option value="Amazon">Amazon</option>
                            <option value="Mercado Livre">Mercado Livre</option>
                            <option value="Shein">Shein</option>
                            <option value="Magalu">Magalu</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1">Categoria</label>
                          <select
                            value={extractedPreview.category}
                            onChange={(e) => setExtractedPreview({ ...extractedPreview, category: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50"
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

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">Selo / Badge Destaque</label>
                          <input
                            type="text"
                            value={extractedPreview.badge || ''}
                            onChange={(e) => setExtractedPreview({ ...extractedPreview, badge: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-slate-50 text-purple-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">Seu Link de Afiliado Processado</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={extractedPreview.storeUrl}
                            onChange={(e) => setExtractedPreview({ ...extractedPreview, storeUrl: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-purple-800 bg-purple-50/50"
                          />
                          <a
                            href={extractedPreview.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-700"
                            title="Testar Link em nova aba"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Confirm Button */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleConfirmAddExtracted}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>APROVAR E PUBLICAR ACHADINHO</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: GERADOR DE ACHADINHO EM MASSA COM IA */}
          {activeTab === 'generator' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-5 text-white shadow-lg flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl shrink-0">
                  <Sparkles className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm mb-1">Gerador de Achadinhos Virais Automáticos</h3>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    Precisa preencher seu site rapidamente com ofertas em alta? Selecione a loja e categoria para a IA buscar e criar os achadinhos mais populares do momento com seus links de afiliado!
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1">Loja Alvo</label>
                    <select
                      value={genStore}
                      onChange={(e) => setGenStore(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="Shopee">Shopee</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Mercado Livre">Mercado Livre</option>
                      <option value="Shein">Shein</option>
                      <option value="Magalu">Magalu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1">Categoria</label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="Eletrônicos">Eletrônicos</option>
                      <option value="Casa">Casa & Cozinha</option>
                      <option value="Moda">Moda</option>
                      <option value="Beleza">Beleza & Perfumaria</option>
                      <option value="Utilidades">Utilidades Domésticas</option>
                      <option value="Infantil">Brinquedos & Infantil</option>
                      <option value="Acessórios">Acessórios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1">Quantidade</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value={1}>1 Achadinho</option>
                      <option value={3}>3 Achadinhos</option>
                      <option value={5}>5 Achadinhos</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleGenerateDeals}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pesquisando e Gerando Achadinhos...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>GERAR ACHADINHO(S) COM IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated List */}
              {generatedProducts.length > 0 && (
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {generatedProducts.length} Achadinho(s) Gerado(s) com Sucesso!
                    </h4>
                    <button
                      onClick={handleAddAllGenerated}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>PUBLICAR TODOS NO SITE</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedProducts.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-slate-900 line-clamp-2">{p.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-700">R$ {p.price.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 line-through">R$ {p.originalPrice.toFixed(2)}</span>
                            <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              -{p.discountPercentage}%
                            </span>
                          </div>
                          <span className="inline-block text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {p.store} • {p.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: LINKS & TAGS DE AFILIADO */}
          {activeTab === 'affiliates' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-600" />
                    Configuração Padrão de IDs de Afiliado
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Insira seus códigos/IDs de afiliado das lojas. Quando você colar qualquer URL na aba de extração automática, nós anexaremos estes IDs automaticamente a todos os links gerados!
                  </p>
                </div>

                {savedConfigNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Configurações de afiliado salvas com sucesso!</span>
                  </div>
                )}

                <form onSubmit={handleSaveAffiliateConfig} className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  {/* Shopee */}
                  <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-1.5">
                    <label className="block text-orange-950 font-bold flex items-center justify-between">
                      <span>Shopee (Sub_ID / Código de Rastreio)</span>
                      <span className="text-[10px] text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">sub_id</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: achadinhos_vip ou seu_subid"
                      value={affiliateConfig.shopeeTag || ''}
                      onChange={(e) => setAffiliateConfig({ ...affiliateConfig, shopeeTag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-orange-300 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>

                  {/* Amazon */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                    <label className="block text-amber-950 font-bold flex items-center justify-between">
                      <span>Amazon Associates Tag</span>
                      <span className="text-[10px] text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">tag</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: achadinhosvip-20"
                      value={affiliateConfig.amazonTag || ''}
                      onChange={(e) => setAffiliateConfig({ ...affiliateConfig, amazonTag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>

                  {/* Mercado Livre */}
                  <div className="p-4 bg-yellow-50/60 rounded-xl border border-yellow-200 space-y-1.5">
                    <label className="block text-yellow-950 font-bold flex items-center justify-between">
                      <span>Mercado Livre Afiliados (Matt Tool ID)</span>
                      <span className="text-[10px] text-yellow-800 bg-white px-2 py-0.5 rounded border border-yellow-200">matt_tool</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 12345678"
                      value={affiliateConfig.mercadoLivreTag || ''}
                      onChange={(e) => setAffiliateConfig({ ...affiliateConfig, mercadoLivreTag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-yellow-300 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>

                  {/* Shein */}
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-1.5">
                    <label className="block text-slate-900 font-bold flex items-center justify-between">
                      <span>Shein Affiliate ID</span>
                      <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">aff_id</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: aff_shein_code"
                      value={affiliateConfig.sheinTag || ''}
                      onChange={(e) => setAffiliateConfig({ ...affiliateConfig, sheinTag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>

                  {/* Magalu */}
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                    <label className="block text-blue-950 font-bold flex items-center justify-between">
                      <span>Magalu / Magazine Você ID</span>
                      <span className="text-[10px] text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">utm_source</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: magazine_seunome"
                      value={affiliateConfig.magaluTag || ''}
                      onChange={(e) => setAffiliateConfig({ ...affiliateConfig, magaluTag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-blue-300 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SALVAR CONFIGURAÇÕES DE AFILIADO</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB: CONFIGURAÇÕES DO SITE (CUPOM, ZAP, TELEGRAM) */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Personalização do Site, Cupom & Redes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Personalize o cupom em destaque e os links dos seus grupos do WhatsApp e Telegram para direcionar seus leitores e clientes.
                  </p>
                </div>

                {siteConfigSavedNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Configurações do site salvas com sucesso! O cupom e links de grupos já estão ativos.</span>
                  </div>
                )}

                <form onSubmit={handleSaveSiteConfig} className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  {/* Coupon Code Field */}
                  <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                    <label className="block text-purple-950 font-black text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-yellow-500" />
                        Código do Cupom em Destaque (Barra Superior) *
                      </span>
                      <span className="text-[10px] text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 font-bold uppercase">topCouponCode</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: ACHABOX30, ACHADO30, DESCONTO20"
                      value={localSiteConfig.topCouponCode}
                      onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, topCouponCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-purple-300 bg-white font-mono font-extrabold text-sm text-purple-900 uppercase tracking-wider"
                    />
                    <p className="text-[11px] text-purple-800 font-normal">
                      Exibido no topo do site com um botão rápido que permite aos visitantes copiar o cupom com 1 clique!
                    </p>
                  </div>

                  {/* WhatsApp Group URL */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                    <label className="block text-emerald-950 font-black text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        Link do Grupo VIP do WhatsApp *
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">whatsappGroupUrl</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://chat.whatsapp.com/G123456789... ou https://wa.me/55..."
                      value={localSiteConfig.whatsappGroupUrl}
                      onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, whatsappGroupUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono text-slate-800"
                    />
                    <p className="text-[11px] text-emerald-800 font-normal">
                      Altera todos os botões "Grupo VIP / WhatsApp" do cabeçalho, da barra de anúncios e do rodapé.
                    </p>
                  </div>

                  {/* Telegram Channel URL */}
                  <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 space-y-2">
                    <label className="block text-sky-950 font-black text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-sky-600" />
                        Link do Canal do Telegram *
                      </span>
                      <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 font-bold">telegramGroupUrl</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://t.me/seu_canal_de_ofertas"
                      value={localSiteConfig.telegramGroupUrl}
                      onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, telegramGroupUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-sky-300 bg-white text-xs font-mono text-slate-800"
                    />
                    <p className="text-[11px] text-sky-800 font-normal">
                      Altera todos os botões "Telegram" do topo e do rodapé do site.
                    </p>
                  </div>

                  {/* Announcement Bar Text */}
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                    <label className="block text-amber-950 font-bold text-xs">
                      Texto do Anúncio do Topo (Live Ticker)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 🔥 OFERTAS IMPERDÍVEIS DAS MELHORES LOJAS | CUPONS EXCLUSIVOS DIÁRIOS"
                      value={localSiteConfig.announcementText}
                      onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, announcementText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-800"
                    />
                  </div>

                  {/* Site Name & Tagline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        Nome do Site
                      </label>
                      <input
                        type="text"
                        value={localSiteConfig.siteName}
                        onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, siteName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-extrabold text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        Slogan / Subtítulo
                      </label>
                      <input
                        type="text"
                        value={localSiteConfig.tagline}
                        onChange={(e) => setLocalSiteConfig({ ...localSiteConfig, tagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-normal"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-purple-700 hover:bg-purple-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>SALVAR CONFIGURAÇÕES DO SITE</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* TAB 4: GERENCIAR OFERTAS ATIVAS */}
          {activeTab === 'manage' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Catálogo de Achadinhos Cadastrados</h3>
                  <p className="text-xs text-slate-500">Total de {products.length} oferta(s) cadastradas no site.</p>
                </div>
                <button
                  onClick={() => setActiveTab('auto')}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Cadastrar Novo Link</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">
                  Nenhuma oferta cadastrada no momento.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                {p.store}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {p.category}
                              </span>
                              {p.isHotDeal && (
                                <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 text-red-500" /> HOT
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 truncate">{p.title}</h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-black text-emerald-700">R$ {p.price.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 line-through">R$ {p.originalPrice.toFixed(2)}</span>
                              <span className="text-[10px] text-red-600 font-extrabold">-{p.discountPercentage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={p.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Testar Link de Afiliado"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Dados e Link do Produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              onUpdateProduct({
                                ...p,
                                isHotDeal: !p.isHotDeal
                              });
                            }}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              p.isHotDeal 
                                ? 'bg-red-50 text-red-600 border border-red-200' 
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title="Alternar Destaque Super Oferta"
                          >
                            <Flame className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* EDIT PRODUCT MODAL OVERLAY */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                <Edit3 className="w-5 h-5 text-purple-700" />
                <span>Editar Dados do Achadinho</span>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProduct(editingProduct);
                setEditingProduct(null);
              }}
              className="space-y-3 text-xs font-semibold text-slate-700"
            >
              <div>
                <label className="block text-slate-800 font-bold mb-1">Título do Produto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-purple-900 font-bold mb-1 flex items-center justify-between">
                  <span>Link de Afiliado (URL de Redirecionamento) *</span>
                  <span className="text-[10px] text-purple-700 font-mono">storeUrl</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.storeUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, storeUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-300 font-mono text-purple-900 bg-purple-50/50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Preço com Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      const p = parseFloat(e.target.value) || 0;
                      const disc = Math.round(((editingProduct.originalPrice - p) / editingProduct.originalPrice) * 100);
                      setEditingProduct({
                        ...editingProduct,
                        price: p,
                        discountPercentage: disc > 0 ? disc : 0
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Preço Original (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.originalPrice}
                    onChange={(e) => {
                      const orig = parseFloat(e.target.value) || 0;
                      const disc = Math.round(((orig - editingProduct.price) / orig) * 100);
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: orig,
                        discountPercentage: disc > 0 ? disc : 0
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Loja</label>
                  <select
                    value={editingProduct.store}
                    onChange={(e) => setEditingProduct({ ...editingProduct, store: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shein">Shein</option>
                    <option value="Magalu">Magalu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Categoria</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
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

              <div>
                <label className="block text-slate-800 font-bold mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
