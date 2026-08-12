import React, { useState } from 'react';
import { Tag, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { SiteConfig } from '../types';

interface CouponTickerProps {
  config: SiteConfig;
}

export const CouponTicker: React.FC<CouponTickerProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(config.topCouponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-center sm:text-left">
          <span className="bg-yellow-400 text-purple-950 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shrink-0 animate-pulse">
            AO VIVO
          </span>
          <p className="truncate font-medium text-purple-100">
            {config.announcementText}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyCoupon}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer"
            title="Clique para copiar o cupom do dia"
          >
            <Tag className="w-3.5 h-3.5 text-yellow-300" />
            <span>Cupom: <strong className="text-yellow-300 tracking-wider">{config.topCouponCode}</strong></span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400 ml-0.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-purple-200 ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-2 border-l border-purple-700/50 pl-2 sm:pl-3">
            <a
              href={config.whatsappGroupUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors font-semibold"
              title="Entrar no Grupo VIP do WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grupo VIP</span>
            </a>
            <a
              href={config.telegramGroupUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-semibold"
              title="Entrar no Canal do Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
