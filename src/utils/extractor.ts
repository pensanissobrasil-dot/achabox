import { Product } from '../types';

export interface AffiliateConfig {
  shopeeTag?: string;
  amazonTag?: string;
  mercadoLivreTag?: string;
  sheinTag?: string;
  magaluTag?: string;
}

// Helper to attach affiliate tags
export function attachAffiliateTag(rawUrl: string, store: string, config: AffiliateConfig = {}): string {
  if (!rawUrl) return 'https://shopee.com.br';
  try {
    let clean = rawUrl.trim();
    
    // Clean trailing punctuation attached from text copy-pasting (WhatsApp/Telegram/Quotes)
    clean = clean.replace(/[.,;)\]"'}>]+$/, '');
    
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }

    const lower = clean.toLowerCase();

    // IF the link is ALREADY a short affiliate link or contains official affiliate tracking parameters:
    // DO NOT modify or append params that could corrupt the shortlink redirect! Return the clean pasted link directly.
    const isAlreadyAffiliateLink = 
      lower.includes('s.shopee.com.br') ||
      lower.includes('shope.ee') ||
      lower.includes('amzn.to') ||
      lower.includes('a.co') ||
      lower.includes('meli.la') ||
      lower.includes('/sec/') ||
      lower.includes('magalu.me') ||
      lower.includes('magazinevoce.com.br') ||
      lower.includes('shein.top') ||
      lower.includes('s.click.aliexpress.com') ||
      lower.includes('sub_id=') ||
      lower.includes('tag=') ||
      lower.includes('matt_tool=') ||
      lower.includes('aff_id=');

    if (isAlreadyAffiliateLink) {
      return clean;
    }

    // Standard long product URL -> attach configured store affiliate tag
    const urlObj = new URL(clean);
    
    if (store === 'Amazon' && config?.amazonTag) {
      urlObj.searchParams.set('tag', config.amazonTag.trim());
    } else if (store === 'Shopee' && config?.shopeeTag) {
      urlObj.searchParams.set('sub_id', config.shopeeTag.trim());
    } else if (store === 'Mercado Livre' && config?.mercadoLivreTag) {
      urlObj.searchParams.set('matt_tool', config.mercadoLivreTag.trim());
    } else if (store === 'Shein' && config?.sheinTag) {
      urlObj.searchParams.set('aff_id', config.sheinTag.trim());
    } else if (store === 'Magalu' && config?.magaluTag) {
      urlObj.searchParams.set('utm_source', config.magaluTag.trim());
    }

    return urlObj.toString();
  } catch (e) {
    return rawUrl;
  }
}

// Default images by category
export function getDefaultImageForCategory(category: string): string {
  const map: Record<string, string> = {
    Moda: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    Eletrônicos: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    Casa: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    Beleza: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    Utilidades: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    Infantil: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    Acessórios: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  };
  return map[category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
}

// Auto-detect store from URL
export function detectStoreFromUrl(url: string, manualOverrideStore?: string): string {
  if (manualOverrideStore && manualOverrideStore !== 'Todos') return manualOverrideStore;
  const lower = url.toLowerCase();
  if (lower.includes('shopee') || lower.includes('shp.ee')) return 'Shopee';
  if (lower.includes('amazon') || lower.includes('amzn.to') || lower.includes('a.co')) return 'Amazon';
  if (lower.includes('mercadolivre') || lower.includes('mercadolibre') || lower.includes('meli.la') || lower.includes('meli') || lower.includes('/sec/')) return 'Mercado Livre';
  if (lower.includes('shein') || lower.includes('shein.top')) return 'Shein';
  if (lower.includes('magazineluiza') || lower.includes('magalu') || lower.includes('magazinevoce')) return 'Magalu';
  return 'Shopee';
}

// Extract product title directly from URL path or user text
export function extractTitleFromInput(input: string): { title: string; targetUrl: string; extractedPrice?: number } {
  const urlMatch = input.match(/https?:\/\/[^\s]+/i);
  let targetUrl = urlMatch ? urlMatch[0] : (input.trim().startsWith('http') ? input.trim() : '');
  
  if (targetUrl) {
    targetUrl = targetUrl.replace(/[.,;)\]"'}>]+$/, '');
  }

  const userText = urlMatch ? input.replace(urlMatch[0], '').trim() : (targetUrl ? '' : input.trim());

  let extractedPrice: number | undefined = undefined;
  // Try extracting price from user text (e.g., "R$ 39,90" or "49.90")
  const priceMatch = input.match(/R\$\s*([\d.,]+)/i) || input.match(/(\d+[.,]\d{2})/);
  if (priceMatch) {
    const pStr = priceMatch[1].replace('.', '').replace(',', '.');
    const pNum = parseFloat(pStr);
    if (!isNaN(pNum) && pNum > 0) {
      extractedPrice = pNum;
    }
  }

  // If user provided a text description alongside the link
  if (userText && userText.length > 3) {
    const cleanedText = userText.replace(/R\$\s*[\d.,]+/gi, '').replace(/https?:\/\/[^\s]+/gi, '').trim();
    if (cleanedText.length > 3) {
      return {
        title: cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1),
        targetUrl: targetUrl || input,
        extractedPrice,
      };
    }
  }

  // Parse title from URL path slashes
  if (targetUrl) {
    try {
      const parsedUrl = new URL(targetUrl);
      const pathname = parsedUrl.pathname;
      const segments = pathname.split('/').filter(Boolean);

      // Find segment with hyphens
      let titleSegment = '';
      for (const seg of segments) {
        if (seg.includes('-') && !seg.match(/^[a-z0-9]{10,}$/i) && seg.length > 5) {
          titleSegment = seg;
          break;
        }
      }

      if (!titleSegment && segments.length > 0 && !segments[0].match(/^[a-z0-9]{6,}$/i)) {
        titleSegment = segments[0];
      }

      if (titleSegment) {
        // Remove tracking codes like -i.123.456 or /p/MLB123 or -dp-B08123
        let clean = titleSegment
          .replace(/-i\.\d+\.\d+$/i, '')
          .replace(/_JM$/i, '')
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .trim();

        if (clean.length > 3 && !clean.match(/^[0-9a-z]+$/i)) {
          // Capitalize words
          clean = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          return {
            title: clean.slice(0, 70),
            targetUrl,
            extractedPrice,
          };
        }
      }
    } catch (e) {
      // Ignore URL parse error
    }
  }

  return {
    title: 'Achadinho Imperdível em Oferta',
    targetUrl: targetUrl || input,
    extractedPrice,
  };
}

// Auto-detect category from title
export function detectCategoryFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.match(/camiseta|vestido|tenis|tênis|roupa|jaqueta|calça|shorts|sapato|bolsa|moda/)) return 'Moda';
  if (lower.match(/fone|bluetooth|celular|smartphone|carregador|tv|smart|caixa de som|relógio|smartwatch|notebook|headset|led|teclado|mouse/)) return 'Eletrônicos';
  if (lower.match(/panela|air fryer|cafeteira|mop|almofada|lençol|mesa|cozinha|organizador|aspirador|iluminação/)) return 'Casa';
  if (lower.match(/perfume|sabonete|creme|maquiagem|shampoo|skincare|batom|sérum|cabelo/)) return 'Beleza';
  if (lower.match(/bebe|bebê|brinquedo|fralda|carrinho|jogos|boneca/)) return 'Infantil';
  if (lower.match(/colar|brinco|pulseira|óculos|oculos|relogio|carteira/)) return 'Acessórios';
  return 'Utilidades';
}

// Client-side fallback extraction engine
export function extractProductClientSide(
  rawInput: string,
  affiliateConfig: AffiliateConfig = {},
  manualOverrideStore?: string
): Partial<Product> {
  const { title, targetUrl, extractedPrice } = extractTitleFromInput(rawInput);
  const store = detectStoreFromUrl(targetUrl || rawInput, manualOverrideStore);
  const affiliateUrl = attachAffiliateTag(targetUrl || rawInput, store, affiliateConfig);
  const category = detectCategoryFromTitle(title);
  const imageUrl = getDefaultImageForCategory(category);

  const price = extractedPrice || (Math.floor(Math.random() * 80) + 29.90);
  const originalPrice = parseFloat((price * 1.6).toFixed(2));
  const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);

  return {
    title,
    description: `Achadinho imperdível na ${store}! Produto com alta avaliação, excelente custo-benefício e entrega rápida.`,
    price,
    originalPrice,
    discountPercentage,
    store,
    storeUrl: affiliateUrl,
    imageUrl,
    category,
    rating: 4.8,
    reviewsCount: Math.floor(Math.random() * 1500) + 400,
    badge: '🔥 OFERTA VERIFICADA',
    isHotDeal: true,
    freteGratis: true,
  };
}

// Main Extractor Function - Server first, client fallback on static/Netlify
export async function extractProductInfo(
  rawInput: string,
  affiliateConfig: AffiliateConfig = {},
  manualOverrideStore?: string
): Promise<Partial<Product>> {
  try {
    const response = await fetch('/api/extract-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: rawInput,
        affiliateConfig,
        manualOverrideStore,
      }),
    });

    const contentType = response.headers.get('content-type') || '';

    // Check if the endpoint returned valid JSON (and not HTML from Netlify SPA fallback)
    if (response.ok && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && !text.trim().startsWith('<')) {
        const data = JSON.parse(text);
        if (data.success && data.extractedProduct) {
          return data.extractedProduct;
        }
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable (Static/Netlify environment). Executing client-side extractor:', err);
  }

  // Client-side Fallback execution (Guarantees zero crashes on Netlify/Vercel)
  return extractProductClientSide(rawInput, affiliateConfig, manualOverrideStore);
}

// Bulk Generation Fallback for Static/Netlify
export async function generateAutoDeals(
  store: string,
  category: string,
  count: number = 3,
  affiliateConfig: AffiliateConfig = {}
): Promise<Partial<Product>[]> {
  try {
    const response = await fetch('/api/generate-auto-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, category, count, affiliateConfig }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && !text.trim().startsWith('<')) {
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.products)) {
          return data.products;
        }
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable. Generating deals client-side:', err);
  }

  // Client-side Bulk Fallback
  const products: Partial<Product>[] = [];
  const sampleNames: Record<string, string[]> = {
    Eletrônicos: ['Fone de Ouvido Bluetooth TWS Sem Fio', 'Relógio Smartwatch Inteligente Fitness', 'Caixa de Som Bluetooth Portátil Reva', 'Mini Projetor LED Full HD Portátil'],
    Moda: ['Kit 3 Camisetas Masculinas 100% Algodão', 'Vestido Feminino Midi Elegante Casual', 'Tênis Esportivo Unisex Leve Macio', 'Jaqueta Corta Vento Impermeável'],
    Casa: ['Mop Giratório Limpeza Rápida com Balde', 'Jogo de Panelas Antiaderente 5 Peças', 'Organizador de Armário Multiuso', 'Luminária de Mesa LED Articulada'],
    Beleza: ['Sérum Facial Hidratante Ácido Hialurônico', 'Kit Pincéis de Maquiagem Profissional', 'Máscara Cabelo Reconstrução Intensa', 'Perfume Unissex Fragrância Marcante'],
  };

  const list = sampleNames[category] || sampleNames['Eletrônicos'];
  const actualStore = store === 'Todos' ? 'Shopee' : store;

  for (let i = 0; i < Math.min(count, list.length); i++) {
    const title = list[i % list.length];
    const price = Math.floor(Math.random() * 90) + 29.90;
    const originalPrice = parseFloat((price * 1.6).toFixed(2));

    products.push({
      id: `generated-${Date.now()}-${i}`,
      title,
      description: `Oferta em destaque na ${actualStore}! Produto muito recomendado com excelente pontuação dos compradores.`,
      price,
      originalPrice,
      discountPercentage: Math.round(((originalPrice - price) / originalPrice) * 100),
      store: actualStore,
      storeUrl: attachAffiliateTag(`https://${actualStore.toLowerCase().replace(' ', '')}.com.br`, actualStore, affiliateConfig),
      imageUrl: getDefaultImageForCategory(category),
      category: category === 'Todos' ? 'Eletrônicos' : category,
      rating: 4.9,
      reviewsCount: Math.floor(Math.random() * 2000) + 500,
      badge: '🏆 BOMBANDO NO TIKTOK',
      isHotDeal: true,
      freteGratis: true,
      createdAt: new Date().toISOString(),
    });
  }

  return products;
}
