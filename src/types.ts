export type StoreType = 'Todos' | 'Shopee' | 'Amazon' | 'Mercado Livre' | 'Shein' | 'Magalu';

export type CategoryType = 
  | 'Todos' 
  | 'Moda' 
  | 'Eletrônicos' 
  | 'Casa' 
  | 'Beleza' 
  | 'Utilidades' 
  | 'Infantil' 
  | 'Acessórios';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  store: Exclude<StoreType, 'Todos'>;
  storeUrl: string;
  imageUrl: string;
  category: CategoryType;
  rating: number;
  reviewsCount: number;
  badge?: string; // e.g. "50% OFF", "🏆 #1 Mais Vendido", "TOP ACHADO"
  isHotDeal?: boolean;
  freteGratis?: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  couponCode?: string;
  buttonText: string;
  imageUrl: string;
  link: string;
  gradientBg: string;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  announcementText: string;
  topCouponCode: string;
  whatsappGroupUrl: string;
  telegramGroupUrl: string;
}

export interface Coupon {
  id: string;
  store: Exclude<StoreType, 'Todos'>;
  code: string;
  discount: string;
  minPurchase?: string;
  validUntil?: string;
}

export interface AffiliateConfig {
  shopeeTag?: string; // e.g. "achadinhos_vip" or full affiliate link
  amazonTag?: string; // e.g. "meuachado-20"
  mercadoLivreTag?: string; // e.g. "matt_tool=12345"
  sheinTag?: string; // e.g. "aff_id=987"
  magaluTag?: string; // e.g. "magazinename"
}

export interface AutoExtractRequest {
  url: string;
  affiliateConfig?: AffiliateConfig;
  manualOverrideStore?: StoreType;
}

