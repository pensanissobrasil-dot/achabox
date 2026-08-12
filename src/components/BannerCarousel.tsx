import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Banner } from '../types';

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative my-4 sm:my-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-gradient-to-r ${currentBanner.gradientBg} text-white min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex items-center border border-purple-500/30`}>
        
        {/* Background decorative ribbons & elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Banner Content Layout */}
        <div className="relative z-10 w-full p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6">
          
          {/* Left Text & CTA Column */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4 text-left">
            
            {/* Top Badge matching reference image */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-purple-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {currentBanner.discountBadge}
              </span>
              {currentBanner.couponCode && (
                <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  Cupom: {currentBanner.couponCode}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
              {currentBanner.title}
            </h2>

            {/* Subtitle */}
            <p className="text-purple-100 text-xs sm:text-sm md:text-base font-normal max-w-lg leading-relaxed">
              {currentBanner.subtitle}
            </p>

            {/* Price badge box matching reference image */}
            <div className="inline-flex items-center gap-3 bg-purple-950/60 backdrop-blur-md p-2.5 rounded-xl border border-purple-400/30">
              <div className="bg-yellow-400 text-purple-950 text-center font-black rounded-lg px-2 py-1 text-xs sm:text-sm leading-tight">
                ATÉ<br/><span className="text-sm sm:text-base">50%</span><br/>OFF
              </div>
              <div className="text-xs sm:text-sm font-medium">
                <div className="text-yellow-300 font-bold">Economia Garantida</div>
                <div className="text-purple-200 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  Links Verificados
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <a
                href={currentBanner.link}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{currentBanner.buttonText}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </a>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="hidden md:block md:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-xs h-56 lg:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform rotate-1 transition-all hover:rotate-0">
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 text-center text-xs font-semibold">
                🔥 Mais de 10.000 achadinhos entregues!
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Navigation Buttons - Matching white circular arrows in screenshot */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-20"
          title="Banner Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-20"
          title="Próximo Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
