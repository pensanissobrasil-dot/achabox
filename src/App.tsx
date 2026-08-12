import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreType, CategoryType, SiteConfig } from './types';
import { 
  INITIAL_SITE_CONFIG, 
  INITIAL_BANNERS, 
  INITIAL_PRODUCTS 
} from './data/mockData';
import { CouponTicker } from './components/CouponTicker';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { BannerCarousel } from './components/BannerCarousel';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddProductModal } from './components/AddProductModal';
import { EditSiteModal } from './components/EditSiteModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { Footer } from './components/Footer';
import { Sparkles, ShoppingBag, Plus, RefreshCw, Flame } from 'lucide-react';

export default function App() {
  // Site Configuration State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('achadinhos_site_config');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
  });

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('achadinhos_products_list');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Favorites State
  const [favorites, setFavorites] = useState<Product[]>(() => {
    const saved = localStorage.getItem('achadinhos_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Todos');
  const [selectedStore, setSelectedStore] = useState<StoreType>('Todos');
  const [sortBy, setSortBy] = useState('relevancia');
  const [onlyHotDeals, setOnlyHotDeals] = useState(false);

  // Modals States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditSiteModalOpen, setIsEditSiteModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('achadinhos_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('achadinhos_products_list', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('achadinhos_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Internal Admin Triggers: URL parameter (?admin=true or #admin) & Keyboard shortcut (Ctrl+Shift+A or Alt+A)
  useEffect(() => {
    const checkAdminAccess = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsAdminPanelOpen(true);
      }
    };

    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminAccess);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle Favorites toggle
  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Handle Adding New Product
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Handle Deleting Product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setFavorites((prev) => prev.filter((f) => f.id !== productId));
  };

  // Handle Updating Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  // Handle Updating Site Config
  const handleSaveConfig = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
  };

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesCategory = p.category.toLowerCase().includes(q);
          const matchesStore = p.store.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q) || false;
          if (!matchesTitle && !matchesCategory && !matchesStore && !matchesDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
          return false;
        }

        // Store filter
        if (selectedStore !== 'Todos' && p.store !== selectedStore) {
          return false;
        }

        // Hot deals filter
        if (onlyHotDeals && !p.isHotDeal) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'desconto') {
          return b.discountPercentage - a.discountPercentage;
        }
        if (sortBy === 'menor-preco') {
          return a.price - b.price;
        }
        if (sortBy === 'maior-preco') {
          return b.price - a.price;
        }
        if (sortBy === 'avaliacoes') {
          return b.rating - a.rating;
        }
        // Default: relevância / recência
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedStore, onlyHotDeals, sortBy]);

  // Favorite product IDs set for quick lookup
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      
      {/* Top Coupon Ticker */}
      <CouponTicker config={siteConfig} />

      {/* Main Header */}
      <Header
        config={siteConfig}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenEditSiteModal={() => setIsEditSiteModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Banner Carousel matching reference photo design */}
      <BannerCarousel banners={INITIAL_BANNERS} />

      {/* Store Filters & Sorting Bar */}
      <FilterBar
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
        sortBy={sortBy}
        onSortChange={setSortBy}
        productsCount={filteredProducts.length}
        onlyHotDeals={onlyHotDeals}
        onToggleHotDeals={() => setOnlyHotDeals((prev) => !prev)}
      />

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        
        {/* Active Filter Badges notice if any */}
        {(searchQuery || selectedCategory !== 'Todos' || selectedStore !== 'Todos' || onlyHotDeals) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Filtros ativos:</span>
            {selectedCategory !== 'Todos' && (
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                Categoria: {selectedCategory}
              </span>
            )}
            {selectedStore !== 'Todos' && (
              <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-200">
                Loja: {selectedStore}
              </span>
            )}
            {onlyHotDeals && (
              <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" /> Super Ofertas
              </span>
            )}
            {searchQuery && (
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setSelectedStore('Todos');
                setOnlyHotDeals(false);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline ml-auto text-xs cursor-pointer"
            >
              Limpar todos
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200 max-w-lg mx-auto my-8 space-y-4">
            <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Nenhum achadinho encontrado</h3>
            <p className="text-xs text-slate-500">
              Não encontramos ofertas para os filtros selecionados. Tente mudar a busca ou selecionar outra categoria.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                  setSelectedStore('Todos');
                  setOnlyHotDeals(false);
                }}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Resetar Todos os Filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.has(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer config={siteConfig} />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={selectedProduct ? favoriteIds.has(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <EditSiteModal
        isOpen={isEditSiteModalOpen}
        onClose={() => setIsEditSiteModalOpen(false)}
        config={siteConfig}
        onSaveConfig={handleSaveConfig}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProduct={handleUpdateProduct}
        siteConfig={siteConfig}
        onSaveConfig={handleSaveConfig}
      />

      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleToggleFavorite}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsFavoritesDrawerOpen(false);
        }}
      />

    </div>
  );
}
