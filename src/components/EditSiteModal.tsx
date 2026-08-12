import React, { useState } from 'react';
import { SiteConfig } from '../types';
import { X, Settings, Check, Sparkles, Edit3 } from 'lucide-react';

interface EditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onSaveConfig: (newConfig: SiteConfig) => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [siteName, setSiteName] = useState(config.siteName);
  const [tagline, setTagline] = useState(config.tagline);
  const [announcementText, setAnnouncementText] = useState(config.announcementText);
  const [topCouponCode, setTopCouponCode] = useState(config.topCouponCode);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(config.whatsappGroupUrl);
  const [telegramGroupUrl, setTelegramGroupUrl] = useState(config.telegramGroupUrl);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      siteName: siteName || 'achabox',
      tagline,
      announcementText,
      topCouponCode,
      whatsappGroupUrl,
      telegramGroupUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400 text-purple-950 rounded-xl">
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Personalizar Nome e Dados do Site</h2>
              <p className="text-xs text-purple-200">Mude o nome do site mantendo o mesmo visual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700 overflow-y-auto">
          
          {/* Site Name Field - Key feature for the user prompt */}
          <div>
            <label className="block text-slate-800 font-extrabold text-sm mb-1">
              Nome do Site *
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Ex: Achadinhos, Achadinhos da Carol, Ofertas VIP"
              className="w-full px-4 py-3 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/50 font-black text-slate-900 text-base"
            />
            <p className="text-[11px] text-slate-500 font-normal mt-1">
              O nome exibido no cabeçalho e na logo do site.
            </p>
          </div>

          {/* Subtitle / Tagline */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Subtítulo / Slogan
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex: Os melhores achadinhos da Shopee e Amazon em um só lugar!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal text-xs"
            />
          </div>

          {/* Top Announcement Bar Text */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Texto da Barra Superior de Anúncios
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Ex: 🔥 OFERTAS IMPERDÍVEIS DAS MELHORES LOJAS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-normal text-xs"
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Código do Cupom de Destaque
            </label>
            <input
              type="text"
              value={topCouponCode}
              onChange={(e) => setTopCouponCode(e.target.value)}
              placeholder="Ex: ACHADO30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50 font-bold text-purple-900 uppercase tracking-wider"
            />
          </div>

          {/* Community Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Link Grupo WhatsApp</label>
              <input
                type="url"
                value={whatsappGroupUrl}
                onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-normal text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-800 font-bold mb-1">Link Canal Telegram</label>
              <input
                type="url"
                value={telegramGroupUrl}
                onChange={(e) => setTelegramGroupUrl(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-normal text-[11px]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>SALVAR ALTERAÇÕES</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
