import React, { useState } from 'react';
import { Target, Zap, Building2, Copy, CheckCircle2 } from 'lucide-react';
import { generateSponsorMatcher } from '../../services/gemini';
import { cn } from '../../lib/utils';
import { CardSkeleton } from '../CardSkeleton';

export const SponsorMatcher = ({ userKey, onShowToast }) => {
  const [brief, setBrief] = useState('');
  const [clubType, setClubType] = useState('Tech Club');
  const [footfall, setFootfall] = useState('500');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState(null); // { sponsors: [] }
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleGenerate = async () => {
    if(!brief || !footfall) return;
    setIsGenerating(true);
    try {
      const res = await generateSponsorMatcher(brief, clubType, footfall, userKey);
      if(res && res.sponsors) {
         setData(res);
      }
      onShowToast("Sponsor matches built! 🎯");
    } catch(e) {
      onShowToast("Failed to match sponsors", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyEmail = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px]">
      <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-end gap-4 shrink-0 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px] -z-10 transition-colors"></div>
         <div className="flex-1 min-w-[250px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Event Brief</label>
          <input value={brief} onChange={e=>setBrief(e.target.value)} placeholder="e.g. AI Hackathon..." className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="w-full sm:w-[180px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Club Type</label>
          <select value={clubType} onChange={e=>setClubType(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white cursor-pointer appearance-none">
             {["Tech Club", "Cultural Club", "Sports Club", "Finance Club", "Generic"].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
         </div>
         <div className="w-full sm:w-[150px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Est. Footfall</label>
          <input type="number" value={footfall} onChange={e=>setFootfall(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white font-bold" />
         </div>
         <div className="w-full md:w-auto">
           <button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto px-6 py-[11px] h-[44px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50">
             {isGenerating ? <Zap size={16} className="animate-spin" /> : <Target size={16} />} Find Sponsors
           </button>
         </div>
      </div>

      {isGenerating && <div className="p-10"><CardSkeleton /></div>}

      {!isGenerating && data?.sponsors && (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
            {data.sponsors.sort((a,b)=>b.relevanceScore - a.relevanceScore).map((sp, idx) => (
               <div key={idx} className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-5 shadow-lg flex flex-col slide-up-card group hover:border-[#4f8ef7]/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                     <h3 className="font-bold text-white text-lg tracking-tight uppercase"><Building2 size={16} className="inline mr-2 text-accent -mt-1"/>{sp.category}</h3>
                     <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Fit Score</span>
                       <div className="flex items-center gap-2">
                         <span className="font-black text-white text-lg leading-none">{sp.relevanceScore}<span className="text-gray-500 text-xs font-normal">/10</span></span>
                         <div className="w-12 h-1.5 bg-[#2a2a33] rounded-full overflow-hidden flex">
                            <div className={cn("h-full", sp.relevanceScore >= 8 ? "bg-green-500" : sp.relevanceScore >= 5 ? "bg-yellow-500" : "bg-red-500")} style={{width: `${sp.relevanceScore*10}%`}}></div>
                         </div>
                       </div>
                     </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-5 leading-relaxed font-medium">"{sp.whyFit}"</p>

                  <div className="mb-5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Top Indian Targets</span>
                    <div className="flex flex-wrap gap-2">
                       {sp.targetCompanies.map((c, i) => (
                         <span key={i} className="bg-[#121215] border border-[#2a2a33] px-3 py-1 rounded-full text-xs font-semibold text-gray-300 shadow-sm">{c}</span>
                       ))}
                    </div>
                  </div>

                  {expandedId === idx ? (
                     <div className="mt-auto bg-black/40 border border-[#2a2a33] rounded-xl p-4 relative animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                           Email Template
                           <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-white">Close</button>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-accent font-bold">Subject:</span>
                          <p className="text-xs text-gray-200 mt-0.5">{sp.emailSubject}</p>
                        </div>
                        <div className="relative">
                          <textarea readOnly value={sp.emailBody} className="w-full bg-[#121215] border border-[#2a2a33] rounded-lg p-2 text-xs text-gray-400 h-32 resize-none custom-scrollbar outline-none" />
                          <button onClick={() => copyEmail(sp.emailBody, idx)} className="absolute bottom-2 right-2 bg-accent/20 hover:bg-accent text-accent hover:text-white p-1.5 rounded transition shadow-lg">
                            {copiedId === idx ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                          </button>
                        </div>
                     </div>
                  ) : (
                     <button onClick={() => setExpandedId(idx)} className="mt-auto w-full py-3 bg-[#2a2a33] hover:bg-[#32323d] text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2">
                       View Email Pitch Draft
                     </button>
                  )}
               </div>
            ))}
         </div>
      )}
    </div>
  );
};
