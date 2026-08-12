import React from 'react';
import { SiteConfig } from '../types';
import { ShoppingBag, MessageCircle, Send, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  config: SiteConfig;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdminPanel }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo & Info */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <Logo variant="dark" size="md" />
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Seu portal de achadinhos, promoções e cupons das maiores lojas da internet. Buscamos as melhores ofertas diariamente para você economizar tempo e dinheiro.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={config.whatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Grupo no WhatsApp</span>
              </a>

              <a
                href={config.telegramGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Canal no Telegram</span>
              </a>
            </div>
          </div>

          {/* Lojas Atendidas */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Lojas Parceiras
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Shopee Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Amazon.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Mercado Livre</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>Shein Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Magazine Luiza</span>
              </li>
            </ul>
          </div>

          {/* Destaques e Segurança */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Segurança e Transparência
            </h4>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Links 100% Seguros</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Este site participa de programas de afiliados das lojas parceiras. Ao comprar através dos nossos links, recebemos uma pequena comissão sem nenhum custo adicional para você!
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {config.siteName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>para caçadores de ofertas</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
