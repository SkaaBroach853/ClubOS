import React, { useState } from 'react';
import { Calendar, Download, Copy, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateContentCalendar } from '../services/gemini';

export const ContentCalendar = ({ userKey, onShowToast }) => {
  const [clubType, setClubType] = useState('Tech Club');
  const [frequency, setFrequency] = useState('Weekly');
  const [startDate, setStartDate] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState(null);

  const handleGenerate = async () => {
    if (!startDate) {
      onShowToast("Please pick a start date", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateContentCalendar(clubType, frequency, startDate, userKey);
      if (res && res.posts) setData(res);
      onShowToast("Content Calendar generated!");
    } catch (e) {
      console.error(e);
      onShowToast("Failed to generate calendar.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!data?.posts) return;
    const textData = data.posts.map(p => 
      `--- ${p.week} | ${p.date} ---\nTheme: ${p.theme}\n\nInstagram:\n${p.instagram}\n\nLinkedIn:\n${p.linkedin}\n\nIdea:\n${p.contentIdea}`
    ).join('\n\n\n');
    
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClubOS_Calendar_${clubType.replace(' ','_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card w-full border border-[#2a2a33] rounded-2xl p-6 transition-all duration-700 shadow-xl overflow-hidden mt-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 text-accent relative">
          <div className="p-2 bg-accent/10 rounded-xl relative border border-accent/20">
             <Calendar size={20} className={isGenerating ? 'animate-pulse' : ''} />
          </div>
          <h3 className="font-bold text-gray-100 text-xl tracking-tight">📅 Auto Club Post Generator</h3>
        </div>
        
        {data && (
           <button onClick={handleDownloadTxt} className="text-white transition-colors px-4 py-2 rounded-lg bg-[#2a2a33] hover:bg-[#33333b] border border-[#2a2a33] hover:shadow-lg flex items-center gap-2 text-sm font-semibold w-max shrink-0">
             <Download size={16} /> Download .txt
           </button>
        )}
      </div>

      <div className="bg-[#121215] border border-[#2a2a33] rounded-xl p-4 sm:p-5 flex flex-wrap items-end gap-4 mb-6 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Club Type</label>
          <select value={clubType} onChange={(e) => setClubType(e.target.value)} className="w-full bg-[#16161a] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white text-sm cursor-pointer appearance-none">
             {["Tech Club", "Cultural Club", "Sports Club", "Finance Club", "Photography Club", "Debate Club", "Music Club", "Generic"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Post Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-[#16161a] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white text-sm cursor-pointer appearance-none">
             {["Weekly", "Bi-weekly", "Monthly"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Start From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#16161a] border border-[#2a2a33] p-2-[9px] px-3 h-[42px] rounded-lg outline-none focus:border-accent text-white text-sm cursor-pointer" />
        </div>

        <div className="w-full md:w-auto mt-2 md:mt-0">
           <button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto px-6 py-[11px] h-[42px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm">
             {isGenerating ? <Zap size={16} className="animate-spin" /> : <Calendar size={16} />}
             {isGenerating ? "Generating..." : "Generate Content Calendar"}
           </button>
        </div>
      </div>

      {data?.posts && (
        <div className="bg-[#121215] border border-[#2a2a33] rounded-xl p-6 overflow-x-auto custom-scrollbar flex gap-6 snap-x slide-up-card">
          {data.posts.map((post, idx) => (
             <CalendarColumn key={idx} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarColumn = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedIG, setCopiedIG] = useState(false);
  const [copiedLI, setCopiedLI] = useState(false);

  const getThemeColor = (themeStr) => {
    const ls = themeStr.toLowerCase();
    if(ls.includes('motivat')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if(ls.includes('educat')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if(ls.includes('behind')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if(ls.includes('teaser')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-green-500/10 text-green-400 border-green-500/20';
  };

  const copy = (type, text) => {
    navigator.clipboard.writeText(text);
    if(type==='ig') { setCopiedIG(true); setTimeout(() => setCopiedIG(false), 2000); }
    else { setCopiedLI(true); setTimeout(() => setCopiedLI(false), 2000); }
  };

  return (
    <div className="shrink-0 w-80 bg-[#16161a] border border-[#2a2a33] rounded-xl p-5 flex flex-col snap-start shadow-md hover:border-[#383842] transition-colors relative group">
       <div className="mb-4 pb-4 border-b border-[#2a2a33]">
         <div className="flex items-center justify-between mb-2">
            <h4 className="font-black text-white text-lg tracking-tight">{post.week}</h4>
            <span className="text-xs font-semibold text-gray-500 bg-[#121215] px-2 py-1 rounded">{post.date}</span>
         </div>
         <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block", getThemeColor(post.theme))}>
           {post.theme}
         </span>
       </div>

       <div className="flex-1 space-y-4">
         <div>
            <div className="flex items-center justify-between mb-1.5">
               <span className="text-xs font-bold text-pink-400 flex items-center gap-1">Instagram</span>
               <button onClick={() => copy('ig', post.instagram)} className="text-gray-500 hover:text-white transition-colors" title="Copy">
                 {copiedIG ? <CheckCircle2 size={12} className="text-green-400"/> : <Copy size={12}/>}
               </button>
            </div>
            <div className={cn("text-sm text-gray-300 bg-black/30 p-2.5 rounded-lg border border-[#2a2a33] whitespace-pre-wrap cursor-pointer", !expanded && "line-clamp-3")} onClick={() => setExpanded(!expanded)}>
               {post.instagram}
            </div>
         </div>

         <div>
            <div className="flex items-center justify-between mb-1.5">
               <span className="text-xs font-bold text-blue-400 flex items-center gap-1">LinkedIn</span>
               <button onClick={() => copy('li', post.linkedin)} className="text-gray-500 hover:text-white transition-colors" title="Copy">
                 {copiedLI ? <CheckCircle2 size={12} className="text-green-400"/> : <Copy size={12}/>}
               </button>
            </div>
            <div className={cn("text-sm text-gray-300 bg-black/30 p-2.5 rounded-lg border border-[#2a2a33] whitespace-pre-wrap cursor-pointer", !expanded && "line-clamp-3")} onClick={() => setExpanded(!expanded)}>
               {post.linkedin}
            </div>
         </div>

         <div className="pt-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Visual Idea</span>
            <p className="text-xs text-gray-400 italic">{post.contentIdea}</p>
         </div>
       </div>

       <button onClick={() => setExpanded(!expanded)} className="mt-4 text-xs font-bold text-[#4f8ef7] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         {expanded ? "Collapse" : "Expand Full View"} <ChevronRight size={12} className={expanded ? "rotate-90" : ""} />
       </button>
    </div>
  );
};
