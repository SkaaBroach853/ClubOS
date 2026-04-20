import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';
import { CardSkeleton } from './CardSkeleton';

export const FlyerCard = ({ data, isGenerating, staggerDelay, onRegenerate }) => {
  const flyerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const showSkeleton = isGenerating || !data;

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ClubOS_Flyer.png';
      a.click();
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'vibrant':
        return 'bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] text-white border-0';
      case 'minimal':
        return 'bg-white text-black border-4 border-black';
      case 'dark':
      default:
        return 'bg-gradient-to-br from-[#0f0f11] via-[#1a1a1f] to-black text-white border border-[#2a2a33]';
    }
  };

  const getBadgeClasses = (theme) => {
    if (theme === 'minimal') return 'bg-gray-100 text-black border border-black font-semibold';
    if (theme === 'vibrant') return 'bg-white/20 text-white backdrop-blur-md font-bold';
    return 'bg-[#2a2a33]/80 text-[#4f8ef7] font-semibold border border-[#4f8ef7]/30';
  };

  const getCtaClasses = (theme) => {
    if (theme === 'minimal') return 'bg-black text-white hover:bg-gray-800';
    if (theme === 'vibrant') return 'bg-white text-purple-600 hover:bg-gray-100 shadow-xl shadow-black/20';
    return 'bg-[#4f8ef7] text-white hover:bg-[#5c98f8] shadow-[0_0_20px_rgba(79,142,247,0.4)]';
  };

  return (
    <div className={cn("bg-card border border-[#2a2a33] rounded-2xl p-6 transition-all duration-700 shadow-lg flex flex-col h-[40rem] relative overflow-hidden slide-up-card group", isGenerating && "border-accent/50 shadow-[0_0_15px_rgba(79,142,247,0.15)]")} style={{ animationDelay: `${staggerDelay}ms`, animationFillMode: 'both' }}>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-accent relative">
          {isGenerating && <span className="absolute -inset-2 bg-accent/20 rounded-full blur-xl animate-pulse"></span>}
          <div className="p-2 bg-accent/10 rounded-xl relative border border-accent/20">
             <ImageIcon size={20} className={isGenerating ? 'animate-pulse' : ''} />
          </div>
          <h3 className="font-semibold text-gray-100 text-lg tracking-wide">Flyer Generator</h3>
        </div>
        
        {!showSkeleton && (
          <div className="flex gap-2">
            <button onClick={onRegenerate} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg bg-[#2a2a33]/50 hover:bg-[#2a2a33]/80 flex items-center gap-2 text-xs font-semibold shadow-sm" disabled={isGenerating}>
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} /> Regenerate
            </button>
            <button onClick={handleDownload} disabled={downloading} className="text-white transition-colors p-2 rounded-lg bg-accent/20 hover:bg-accent border border-accent/40 hover:shadow-[0_0_15px_rgba(79,142,247,0.4)] flex items-center gap-2 text-xs font-semibold disabled:opacity-50">
              <Download size={14} /> PNG
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#121215] rounded-xl border border-[#2a2a33]/50 p-4 relative z-0 flex items-center justify-center">
        {showSkeleton ? (
           <div className="w-full h-full p-4"><CardSkeleton /></div>
        ) : (
          <div className="transform scale-[0.8] sm:scale-95 md:scale-100 origin-center transition-transform">
            <div 
              ref={flyerRef}
              className={cn("w-[400px] h-[560px] rounded-2xl flex flex-col justify-between p-8 relative overflow-hidden shadow-2xl", getThemeClasses(data.colorTheme))}
            >
               {/* Noise Overlay */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
               
               <div className="relative z-10 text-center mt-4">
                 <div className="text-6xl mb-3 animate-bounce">{data.emojiAccent}</div>
                 <h1 className="text-3xl font-black tracking-tight leading-tight uppercase relative inline-block">
                    {data.headline}
                 </h1>
                 <p className={cn("text-sm mt-3 font-medium", data.colorTheme==='minimal' ? 'text-gray-600' : 'text-gray-300 opacity-90')}>{data.subheadline}</p>
               </div>

               <div className="relative z-10 bg-black/10 backdrop-blur-md rounded-xl p-4 my-6 text-center border border-white/10">
                  <div className="font-bold text-lg">{data.date}</div>
                  <div className="text-sm mt-1 opacity-80 uppercase tracking-widest">{data.venue}</div>
               </div>

               <div className="relative z-10 flex flex-wrap gap-2 justify-center mb-8">
                 {data.highlights?.map((h, i) => (
                   <span key={i} className={cn("px-3 py-1.5 text-xs rounded-full", getBadgeClasses(data.colorTheme))}>
                     {h}
                   </span>
                 ))}
               </div>

               <div className="relative z-10 w-full text-center mb-4">
                  <button className={cn("w-full py-4 rounded-xl font-black uppercase tracking-wider transition-transform hover:scale-105 active:scale-95", getCtaClasses(data.colorTheme))}>
                    {data.cta}
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
