import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing in process.env');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to append affiliate tags to URLs
function attachAffiliateTag(rawUrl: string, store: string, config: any): string {
  if (!rawUrl) return 'https://shopee.com.br';
  try {
    const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    
    if (store === 'Amazon' && config?.amazonTag) {
      urlObj.searchParams.set('tag', config.amazonTag.trim());
    } else if (store === 'Shopee' && config?.shopeeTag) {
      // Shopee sub_id parameter
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
    // If URL parsing fails, return rawUrl
    return rawUrl;
  }
}

// Default stock Unsplash images based on category
function getDefaultImageForCategory(category: string): string {
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

// HTML Entities decoder
function decodeEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Real server-side metadata extractor for marketplace product links
async function fetchPageMetadata(rawInput: string): Promise<{
  finalUrl: string;
  pageTitle: string;
  ogImage: string;
  ogDescription: string;
  extractedPrice?: number;
  detectedStore: string;
  rawText: string;
}> {
  // Extract URL from input text (e.g. "Fone Bluetooth R$ 39 https://shp.ee/123")
  const urlMatch = rawInput.match(/https?:\/\/[^\s]+/i);
  const targetUrl = urlMatch ? urlMatch[0] : (rawInput.trim().startsWith('http') ? rawInput.trim() : null);
  const rawText = urlMatch ? rawInput.replace(urlMatch[0], '').trim() : (targetUrl ? '' : rawInput);

  let finalUrl = targetUrl || rawInput;
  let pageTitle = '';
  let ogImage = '';
  let ogDescription = '';
  let extractedPrice: number | undefined = undefined;
  let detectedStore = 'Shopee';

  if (targetUrl) {
    try {
      // Preliminary store check
      const lowerTarget = targetUrl.toLowerCase();
      if (lowerTarget.includes('shopee') || lowerTarget.includes('shp.ee')) detectedStore = 'Shopee';
      else if (lowerTarget.includes('amazon') || lowerTarget.includes('amzn.to') || lowerTarget.includes('a.co')) detectedStore = 'Amazon';
      else if (lowerTarget.includes('mercadolivre') || lowerTarget.includes('mercadolibre') || lowerTarget.includes('meli')) detectedStore = 'Mercado Livre';
      else if (lowerTarget.includes('shein')) detectedStore = 'Shein';
      else if (lowerTarget.includes('magazineluiza') || lowerTarget.includes('magalu')) detectedStore = 'Magalu';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      finalUrl = response.url || targetUrl;

      // Re-check store on final redirected URL
      const lowerFinal = finalUrl.toLowerCase();
      if (lowerFinal.includes('shopee') || lowerFinal.includes('shp.ee')) detectedStore = 'Shopee';
      else if (lowerFinal.includes('amazon') || lowerFinal.includes('amzn.to')) detectedStore = 'Amazon';
      else if (lowerFinal.includes('mercadolivre') || lowerFinal.includes('mercadolibre')) detectedStore = 'Mercado Livre';
      else if (lowerFinal.includes('shein')) detectedStore = 'Shein';
      else if (lowerFinal.includes('magazineluiza') || lowerFinal.includes('magalu')) detectedStore = 'Magalu';

      const html = await response.text();

      // Extract Title
      const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title|title)["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        pageTitle = decodeEntities(ogTitleMatch[1].trim());
      }

      // Extract OG Image
      const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        ogImage = ogImageMatch[1].trim();
      }

      // Extract OG Description
      const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description)["']\s+content=["']([^"']+)["']/i);
      if (ogDescMatch && ogDescMatch[1]) {
        ogDescription = decodeEntities(ogDescMatch[1].trim());
      }

      // Extract Price from HTML regex
      const priceMatches = html.match(/R\$\s*([\d.]+,\d{2})/i) || 
                           html.match(/"price":\s*"([\d.]+)"/i) || 
                           html.match(/"price":\s*([\d.]+)/i);
      if (priceMatches && priceMatches[1]) {
        const rawP = priceMatches[1].replace('.', '').replace(',', '.');
        const numP = parseFloat(rawP);
        if (!isNaN(numP) && numP > 0) {
          extractedPrice = numP;
        }
      }

    } catch (err) {
      console.warn('Scraping error / blocked, using URL context fallback:', err);
    }
  }

  return {
    finalUrl,
    pageTitle,
    ogImage,
    ogDescription,
    extractedPrice,
    detectedStore,
    rawText,
  };
}

// API Endpoint 1: Auto-Extract Product Info from Marketplace Link or Text
app.post('/api/extract-product', async (req, res) => {
  try {
    const { url, affiliateConfig, manualOverrideStore } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL ou texto do produto é obrigatório' });
    }

    // 1. Fetch real page metadata from the URL
    const meta = await fetchPageMetadata(url);

    const ai = getGeminiClient();

    const prompt = `
Você é um assistente especialista em e-commerce e achadinhos no Brasil.
O usuário deseja cadastrar um produto real no site.

Dados Reais Extraídos da Web / Link:
- URL Final: "${meta.finalUrl}"
- Loja Identificada: "${meta.detectedStore}"
- Título da Página: "${meta.pageTitle || 'Não encontrado'}"
- Descrição da Página: "${meta.ogDescription || 'Não encontrada'}"
- Preço Detectado: ${meta.extractedPrice ? `R$ ${meta.extractedPrice}` : 'Não encontrado'}
- Texto do Usuário: "${meta.rawText || 'Nenhum'}"
- Link Original: "${url}"

ATENÇÃO RIGOROSA:
1. O título do produto DEVE ser baseado no Título da Página ("${meta.pageTitle}") ou Texto do Usuário. NÃO INVENTE um produto diferente!
2. Se a página for um fone de ouvido, o produto É um fone de ouvido. Se for um tênis, É um tênis. NUNCA altere a categoria para algo aleatório.

Retorne um JSON estrito com:
- title: Título limpo, conciso e atraente em português (máximo 70 caracteres).
- store: Apenas uma das opções exatas: "Shopee", "Amazon", "Mercado Livre", "Shein" ou "Magalu".
- price: Preço promocional em R$ (use ${meta.extractedPrice || 0} se válido, ou um preço de mercado justo para o item).
- originalPrice: Preço original estimado antes do desconto (ex: 40% a 70% acima do preço promocional).
- discountPercentage: Porcentagem de desconto (número inteiro).
- category: Apenas uma das opções: "Moda", "Eletrônicos", "Casa", "Beleza", "Utilidades", "Infantil", "Acessórios".
- description: Breve dica de achadinho destacando a utilidade do produto real.
- badge: Selo chamativo (ex: "🔥 OFERTA VERIFICADA", "🏆 #1 MAIS VENDIDO", "✨ BOMBANDO NO TIKTOK").
- isHotDeal: true
- freteGratis: true
- bestUnsplashKeyword: Termo em inglês para buscar foto no Unsplash caso a foto original não esteja disponível (ex: "wireless earbuds", "sneakers", "air fryer").
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            store: { type: Type.STRING },
            price: { type: Type.NUMBER },
            originalPrice: { type: Type.NUMBER },
            discountPercentage: { type: Type.INTEGER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            badge: { type: Type.STRING },
            isHotDeal: { type: Type.BOOLEAN },
            freteGratis: { type: Type.BOOLEAN },
            bestUnsplashKeyword: { type: Type.STRING },
          },
          required: ['title', 'store', 'price', 'originalPrice', 'category', 'description'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const extractedData = JSON.parse(jsonText);

    // Override store if user manually selected one
    const finalStore = (manualOverrideStore && manualOverrideStore !== 'Todos') 
      ? manualOverrideStore 
      : (extractedData.store || meta.detectedStore || 'Shopee');

    // Attach user affiliate tag to the resolved URL
    const finalAffiliateUrl = attachAffiliateTag(meta.finalUrl || url, finalStore, affiliateConfig);

    // Use REAL og:image from the scraped webpage if valid, else use category/keyword Unsplash image
    let finalImageUrl = meta.ogImage;
    if (!finalImageUrl || !finalImageUrl.startsWith('http') || finalImageUrl.includes('favicon') || finalImageUrl.includes('logo')) {
      finalImageUrl = getDefaultImageForCategory(extractedData.category || 'Eletrônicos');
    }

    const priceNum = Number(extractedData.price) || meta.extractedPrice || 39.90;
    const origPriceNum = Number(extractedData.originalPrice) || priceNum * 1.5;
    const discount = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    return res.json({
      success: true,
      extractedProduct: {
        title: extractedData.title || meta.pageTitle || 'Produto Recomendado',
        description: extractedData.description || 'Achadinho incrível com desconto exclusivo e entrega rápida!',
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercentage: discount > 0 ? discount : 40,
        store: finalStore,
        storeUrl: finalAffiliateUrl,
        imageUrl: finalImageUrl,
        category: extractedData.category || 'Eletrônicos',
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 2000) + 500,
        badge: extractedData.badge || '🔥 OFERTA VERIFICADA',
        isHotDeal: extractedData.isHotDeal ?? true,
        freteGratis: extractedData.freteGratis ?? true,
      },
    });

  } catch (error: any) {
    console.error('Erro na extração do produto:', error);
    return res.status(500).json({
      error: 'Não foi possível extrair os dados automaticamente do link fornecido.',
      details: error?.message || String(error),
    });
  }
});

// API Endpoint 2: Bulk Auto-Generate Trending Marketplace Deals
app.post('/api/generate-auto-deals', async (req, res) => {
  try {
    const { store = 'Shopee', category = 'Eletrônicos', count = 3, affiliateConfig } = req.body;

    const ai = getGeminiClient();

    const prompt = `
Você é um especialista em e-commerce de achadinhos virais no Brasil.
Gere ${count} produtos reais e virais atualmente muito procurados na loja "${store}" na categoria "${category}".

Para cada produto, retorne um objeto no formato estrito com os campos:
- title: Título atrativo do produto em português (ex: "Fones de Ouvido Bluetooth Sem Fio").
- price: Preço promocional em R$ (número float, ex: 39.90).
- originalPrice: Preço original em R$ (número float, ex: 89.90).
- discountPercentage: Número inteiro de porcentagem de desconto.
- category: Apenas uma das opções: "Moda", "Eletrônicos", "Casa", "Beleza", "Utilidades", "Infantil", "Acessórios".
- description: Breve explicação do motivo pelo qual este produto é um achadinho imperdível.
- badge: Selo chamativo (ex: "🏆 #1 MAIS VENDIDO", "🔥 BOMBANDO NO TIKTOK").
- isHotDeal: true
- freteGratis: true
- genericProductKeyword: Palavra chave em inglês para foto Unsplash (ex: "earbuds", "smartwatch", "blender", "dress").
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              originalPrice: { type: Type.NUMBER },
              discountPercentage: { type: Type.INTEGER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              badge: { type: Type.STRING },
              isHotDeal: { type: Type.BOOLEAN },
              freteGratis: { type: Type.BOOLEAN },
              genericProductKeyword: { type: Type.STRING },
            },
            required: ['title', 'price', 'originalPrice', 'category', 'description'],
          },
        },
      },
    });

    const items = JSON.parse(response.text || '[]');

    const generatedProducts = items.map((item: any, idx: number) => {
      const keyword = item.genericProductKeyword || 'shopping';
      const imageUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80`;
      
      const baseUrlMap: Record<string, string> = {
        Shopee: 'https://shopee.com.br',
        Amazon: 'https://amazon.com.br',
        'Mercado Livre': 'https://mercadolivre.com.br',
        Shein: 'https://shein.com',
        Magalu: 'https://magazineluiza.com.br',
      };

      const rawUrl = `${baseUrlMap[store] || 'https://shopee.com.br'}/achado-${idx + 1}`;
      const finalUrl = attachAffiliateTag(rawUrl, store, affiliateConfig);

      return {
        id: `auto-${Date.now()}-${idx}`,
        title: item.title,
        description: item.description,
        price: Number(item.price) || 49.90,
        originalPrice: Number(item.originalPrice) || 99.90,
        discountPercentage: item.discountPercentage || 50,
        store: store as any,
        storeUrl: finalUrl,
        imageUrl: getDefaultImageForCategory(item.category || category),
        category: item.category || category,
        rating: 4.8 + (idx % 2 === 0 ? 0.1 : 0),
        reviewsCount: Math.floor(Math.random() * 3000) + 1000,
        badge: item.badge || '🔥 GERADO AUTOMATICAMENTE',
        isHotDeal: true,
        freteGratis: true,
        createdAt: new Date().toISOString(),
      };
    });

    return res.json({ success: true, products: generatedProducts });

  } catch (error: any) {
    console.error('Erro na geração automática de ofertas:', error);
    return res.status(500).json({ error: 'Erro ao gerar achadinhos automáticos.' });
  }
});

// Vite Middleware for development mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
