import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Zap, ExternalLink, Brush } from 'lucide-react';
import { generateMerchConcepts } from '../../services/gemini';
import { cn } from '../../lib/utils';
import { CardSkeleton } from '../CardSkeleton';

export const MerchStore = ({ userKey, onShowToast }) => {
  const [clubName, setClubName] = useState('');
  const [tagline, setTagline] = useState('');
  const [vibe, setVibe] = useState('Minimalist');
  const [logoBase64, setLogoBase64] = useState(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState([]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    const r = new FileReader(); r.onload = (evt) => setLogoBase64(evt.target.result); r.readAsDataURL(f);
  };

  const handleGenerate = async () => {
    if(!clubName || !vibe) return;
    setIsGenerating(true);
    try {
      const res = await generateMerchConcepts(clubName, tagline, vibe, userKey);
      if(res && res.concepts) {
        setConcepts(res.concepts);
      }
      onShowToast("Designs generated!");
    } catch(e) {
      onShowToast("Generation failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px]">
      
      <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap lg:flex-nowrap items-end gap-4 shrink-0 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[50px] -z-10 group-hover:bg-pink-500/10 transition"></div>
         
         <label className="w-24 h-24 shrink-0 rounded-xl bg-black border border-[#2a2a33] cursor-pointer hover:border-accent flex flex-col items-center justify-center p-2 relative overflow-hidden text-center group">
           {logoBase64 ? <img src={logoBase64} className="max-w-full max-h-full object-contain z-10" alt="logo"/> : <><Brush size={24} className="text-gray-600 group-hover:text-accent mb-1"/><span className="text-[10px] text-gray-500 font-bold leading-tight">Drop<br/>Logo</span></>}
           <input type="file" accept="image/png,image/svg+xml" onChange={handleUpload} className="hidden" />
         </label>

         <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Club Name</label>
          <input value={clubName} onChange={e=>setClubName(e.target.value)} placeholder="e.g. Finance Society" className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="flex-1 min-w-[250px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Tagline (optional)</label>
          <input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="e.g. To the moon 🚀" className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="w-[160px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Vibe</label>
          <select value={vibe} onChange={e=>setVibe(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white cursor-pointer appearance-none">
             {["Minimalist", "Streetwear", "Corporate", "Vintage", "Bold/Loud"].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
         </div>
         <div className="w-full xl:w-auto mt-2 xl:mt-0">
           <button onClick={handleGenerate} disabled={isGenerating} className="w-full xl:w-auto px-6 py-[11px] h-[44px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50">
             {isGenerating ? <Zap size={16} className="animate-spin" /> : <ShoppingBag size={16} />} Design Merch
           </button>
         </div>
      </div>

      {isGenerating && <CardSkeleton />}

      {!isGenerating && concepts.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
            {concepts.map((c, i) => (
               <MerchCard key={i} concept={c} clubName={clubName} tagline={tagline} vibe={vibe} logoBase64={logoBase64} />
            ))}
         </div>
      )}
    </div>
  );
};

const MerchCard = ({ concept, clubName, tagline, vibe, logoBase64 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width, h = cvs.height;
    
    // BG
    ctx.fillStyle = '#1a1a1f'; 
    ctx.fillRect(0,0,w,h);
    
    const [c1, c2, c3] = concept.colorPalette;
    
    // Draw basic shape based on item type
    ctx.fillStyle = c1 || '#333';
    ctx.save();
    ctx.translate(w/2, h/2 - 20);
    const itemLow = concept.item.toLowerCase();
    if(itemLow.includes('t-shirt') || itemLow.includes('hoodie')) {
       ctx.fillRect(-60, -80, 120, 160);
       ctx.fillRect(-90, -80, 30, 50); ctx.fillRect(60, -80, 30, 50); // sleeves
    } else if (itemLow.includes('tote') || itemLow.includes('bag')) {
       ctx.fillRect(-70, -60, 140, 140);
       ctx.strokeStyle = c1; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -60, 40, Math.PI, 0); ctx.stroke();
    } else if (itemLow.includes('cap') || itemLow.includes('hat')) {
       ctx.beginPath(); ctx.arc(0, 0, 60, Math.PI, 0); ctx.fill();
       ctx.fillRect(0, 0, 80, 15);
    } else if (itemLow.includes('sticker') || itemLow.includes('badge')) {
       ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI*2); ctx.fill();
    } else {
       ctx.fillRect(-60, -60, 120, 120);
    }
    ctx.restore();

    // Text & Logo
    ctx.textAlign = 'center';
    ctx.fillStyle = c2 || '#fff';
    
    if (logoBase64) {
      const img = new Image();
      img.onload = () => {
         ctx.drawImage(img, w/2 - 25, h/2 - 50, 50, 50);
         ctx.font = 'bold 16px sans-serif'; ctx.fillText(clubName, w/2, h/2 + 20);
         if(concept.slogan) { ctx.font = '10px serif'; ctx.fillStyle=c3||'#fff'; ctx.fillText(concept.slogan, w/2, h/2 + 40); }
      };
      img.src = logoBase64;
    } else {
      ctx.font = vibe === 'Streetwear' ? '900 24px Impact' : vibe === 'Minimalist' ? '300 20px Helvetica' : 'bold 20px Arial';
      ctx.fillText(clubName, w/2, h/2 - 10);
      if(concept.slogan) { ctx.font = '12px serif'; ctx.fillStyle=c3||'#fff'; ctx.fillText(concept.slogan, w/2, h/2 + 20); }
    }

  }, [concept, clubName, vibe, logoBase64]);

  return (
    <div className="bg-[#121215] border border-[#2a2a33] rounded-2xl overflow-hidden shadow-lg flex flex-col group slide-up-card">
       <div className="bg-[#0b0b0e] border-b border-[#2a2a33] px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-200 text-sm truncate">{concept.item}</span>
       </div>
       <div className="relative">
         <canvas ref={canvasRef} width={250} height={250} className="w-full h-[200px] object-cover" />
         <div className="absolute bottom-2 left-2 flex gap-1 bg-black/50 p-1 rounded backdrop-blur">
            {concept.colorPalette.map(cc => <div key={cc} className="w-4 h-4 rounded-full border border-white/20" style={{backgroundColor: cc}}></div>)}
         </div>
       </div>
       <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-gray-400 italic line-clamp-3 mb-4 leading-relaxed flex-1">"{concept.designDescription}"</p>
          
          <div className="space-y-2 mt-auto">
             <a href={`https://www.canva.com/search/templates?q=${encodeURIComponent(concept.canvaTemplateSearch)}`} target="_blank" rel="noreferrer" className="w-full py-2 bg-[#1a1a1f] border border-[#2a2a33] hover:border-[#00c4cc]/50 hover:text-[#00c4cc] text-gray-300 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                Open in Canva <ExternalLink size={12}/>
             </a>
             <a href={`https://www.printful.com/custom/${encodeURIComponent(concept.printfulCategory)}`} target="_blank" rel="noreferrer" className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5">
                View on Printful <ExternalLink size={12}/>
             </a>
          </div>
       </div>
    </div>
  );
};
