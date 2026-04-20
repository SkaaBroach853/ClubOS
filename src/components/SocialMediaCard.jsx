import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, Camera, Globe, MessageSquare, ExternalLink, Zap, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { CardSkeleton } from './CardSkeleton';
import { generateLinkedInCollabs, generateLinkedInVariants } from '../services/gemini';

export const SocialMediaCard = ({ data, isGenerating, staggerDelay, userKey }) => {
  const [activeTab, setActiveTab] = useState('instagram');
  const [copied, setCopied] = useState(false);
  
  // LinkedIn specialized states
  const [linkedinCollabText, setLinkedinCollabText] = useState('');
  const [collabs, setCollabs] = useState('');
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  
  const [variants, setVariants] = useState(null);
  const [activeVariant, setActiveVariant] = useState('original'); // original | hype | reflective | professional | collab
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);

  const showSkeleton = isGenerating || !data;

  const getActiveText = () => {
    if (!data) return '';
    if (activeTab === 'instagram') return data.instagram;
    if (activeTab === 'whatsapp') return data.whatsapp;
    if (activeTab === 'linkedin') {
      if (activeVariant === 'original') return data.linkedin;
      if (activeVariant === 'collab') return linkedinCollabText;
      return variants ? variants[activeVariant] : data.linkedin;
    }
    return '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText() || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostLinkedIn = () => {
    const text = encodeURIComponent(getActiveText() || '');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=clubos.app&summary=${text}`, '_blank');
  };

  const handleAddCollabs = async () => {
    if (!collabs.trim()) return;
    setIsCollabLoading(true);
    try {
      const result = await generateLinkedInCollabs(data.linkedin, collabs, userKey);
      setLinkedinCollabText(result);
      setActiveVariant('collab');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCollabLoading(false);
    }
  };

  const handleGenerateVariants = async () => {
    setIsVariantsLoading(true);
    try {
      const res = await generateLinkedInVariants(data.linkedin, userKey);
      setVariants({ hype: res.v1, reflective: res.v2, professional: res.v3 });
      setActiveVariant('hype');
    } catch (e) {
      console.error(e);
    } finally {
      setIsVariantsLoading(false);
    }
  };

  const renderInstagram = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return (
      <div className="bg-black text-white rounded-[2rem] border-4 border-[#2a2a33] p-4 pt-8 pb-8 relative w-full max-w-sm mx-auto shadow-xl">
         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#2a2a33] rounded-b-xl"></div>
         <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
               <div className="w-full h-full bg-black rounded-full border border-black"></div>
            </div>
            <span className="font-semibold text-sm">clubos_official</span>
         </div>
         <div className="text-sm whitespace-pre-wrap leading-snug">
           {parts.map((part, i) => part.startsWith('#') ? <span key={i} className="text-blue-400">{part}</span> : part)}
         </div>
      </div>
    );
  };

  const renderWhatsApp = (text) => {
    return (
      <div className="bg-[#efeae2] p-4 rounded-xl h-full flex flex-col justify-end" style={{ backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')", backgroundSize: '400px', opacity: 0.95 }}>
         <div className="bg-[#dcf8c6] text-black p-3 px-4 rounded-2xl rounded-tr-sm max-w-[85%] self-end shadow-sm relative">
            <div className="text-sm whitespace-pre-wrap">{text}</div>
            <div className="text-[10px] text-gray-500 text-right mt-1">10:42 AM ✓✓</div>
         </div>
      </div>
    );
  };

  const renderLinkedIn = (text) => {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="bg-white text-gray-900 rounded-xl p-5 relative overflow-hidden flex-shrink-0 shadow-lg">
           <Globe className="absolute -right-4 -bottom-4 text-blue-100 opacity-30 pointer-events-none" size={120} />
           <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                   <div className="font-bold text-sm">ClubOS Team</div>
                   <div className="text-xs text-gray-500">Just now • 🌐</div>
                </div>
             </div>
           </div>
           
           {(activeVariant !== 'original' && activeVariant !== 'collab') && (
              <div className="mb-3">
                 <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                   {activeVariant} Variant
                 </span>
              </div>
           )}
           
           <div className="text-sm whitespace-pre-wrap leading-relaxed relative z-10">
             {getActiveText()}
           </div>
        </div>

        <div className="bg-[#16161a] border border-[#2a2a33] p-4 rounded-xl flex-shrink-0 text-sm">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-[#2a2a33] pb-3">
             <button onClick={() => setActiveVariant('original')} className={cn("px-3 py-1.5 rounded-lg font-medium transition", activeVariant === 'original' ? "bg-[#2a2a33] text-white" : "text-gray-400 hover:text-white")}>Original</button>
             {linkedinCollabText && (
               <button onClick={() => setActiveVariant('collab')} className={cn("px-3 py-1.5 rounded-lg font-medium transition bg-green-500/10 text-green-400 border border-green-500/30", activeVariant === 'collab' && "bg-green-500/30")}>With Collabs ✨</button>
             )}
             {variants && <>
               <button onClick={() => setActiveVariant('hype')} className={cn("px-3 py-1.5 rounded-lg font-medium transition", activeVariant === 'hype' ? "bg-[#2a2a33] text-white" : "text-gray-400 hover:text-white")}>Hype</button>
               <button onClick={() => setActiveVariant('reflective')} className={cn("px-3 py-1.5 rounded-lg font-medium transition", activeVariant === 'reflective' ? "bg-[#2a2a33] text-white" : "text-gray-400 hover:text-white")}>Reflective</button>
               <button onClick={() => setActiveVariant('professional')} className={cn("px-3 py-1.5 rounded-lg font-medium transition", activeVariant === 'professional' ? "bg-[#2a2a33] text-white" : "text-gray-400 hover:text-white")}>Pro</button>
             </>}
             
             <button onClick={handleGenerateVariants} disabled={isVariantsLoading || variants !== null} className="ml-auto px-3 py-1.5 bg-accent/20 hover:bg-accent/40 text-accent rounded-lg flex items-center gap-1 font-semibold disabled:opacity-50">
               {isVariantsLoading ? <Zap size={14} className="animate-spin" /> : <Zap size={14} />} 3 Variants
             </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1"><Users size={12}/> Tag Collaborators</label>
            <div className="flex gap-2">
              <input value={collabs} onChange={e => setCollabs(e.target.value)} placeholder="Comma separated names..." className="flex-1 bg-[#121215] border border-[#2a2a33] p-2 rounded-lg outline-none focus:border-accent text-white" />
              <button onClick={handleAddCollabs} disabled={isCollabLoading} className="px-4 py-2 bg-[#2a2a33] hover:bg-[#32323d] text-white rounded-lg flex items-center gap-2">
                 {isCollabLoading ? "..." : "Add"}
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
             <button onClick={handlePostLinkedIn} title="Opens LinkedIn with your post pre-filled" className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold rounded-lg transition shadow-md">
                <Globe size={16} /> Post to LinkedIn <ExternalLink size={14} />
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("bg-card border border-[#2a2a33] rounded-2xl p-6 transition-all duration-700 shadow-lg flex flex-col h-[42rem] relative overflow-hidden slide-up-card", isGenerating && "border-accent/50 shadow-[0_0_15px_rgba(79,142,247,0.15)]")} style={{ animationDelay: `${staggerDelay}ms`, animationFillMode: 'both' }}>
      {isGenerating && (
         <div className="absolute inset-0 border-2 border-transparent rounded-2xl bg-gradient-to-r from-accent via-indigo-500 to-accent opacity-20 animate-[shimmer_2s_linear_infinite] pointer-events-none bg-[length:200%_auto]" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', padding: '1px' }}></div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 text-accent w-full">
          {isGenerating && <span className="absolute -inset-2 bg-accent/20 rounded-full blur-xl animate-pulse"></span>}
          <div className="p-2 bg-accent/10 rounded-xl relative border border-accent/20 flex-shrink-0">
            <Share2 size={20} className={isGenerating ? 'animate-pulse' : ''} />
          </div>
          <div className="flex-1 w-full overflow-hidden">
            <h3 className="font-semibold text-gray-100 text-lg tracking-wide mb-2">Social Media</h3>
            <div className="flex bg-[#121215] rounded-lg p-1 border border-[#2a2a33] w-full items-center">
              <button 
                onClick={() => setActiveTab('instagram')}
                className={cn("flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors", activeTab==='instagram' ? "bg-card text-white shadow" : "text-gray-400 hover:text-white")}
              >
                <Camera size={14} /> IG
              </button>
              <button 
                onClick={() => setActiveTab('linkedin')}
                className={cn("flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors", activeTab==='linkedin' ? "bg-card text-white shadow" : "text-gray-400 hover:text-white")}
              >
                <Globe size={14} /> LI
              </button>
              <button 
                onClick={() => setActiveTab('whatsapp')}
                className={cn("flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors", activeTab==='whatsapp' ? "bg-card text-white shadow" : "text-gray-400 hover:text-white")}
              >
                <MessageSquare size={14} /> WA
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
        {showSkeleton ? (
           <div className="mt-4"><CardSkeleton /></div>
        ) : (
          <div className="h-full relative group pb-10">
             <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 z-20 text-gray-400 hover:text-white transition-colors p-2 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-2 text-sm shadow-md"
            >
              {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
            
            {activeTab === 'instagram' && renderInstagram(data?.instagram)}
            {activeTab === 'linkedin' && renderLinkedIn(data?.linkedin)}
            {activeTab === 'whatsapp' && renderWhatsApp(data?.whatsapp)}
          </div>
        )}
      </div>
    </div>
  );
};
