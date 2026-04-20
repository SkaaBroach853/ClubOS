import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CardSkeleton } from './CardSkeleton';

// eslint-disable-next-line no-unused-vars
export const OutputCard = ({ title, Icon, data, isGenerating, staggerDelay, agentId }) => {
  const [copied, setCopied] = useState(false);

  const showSkeleton = isGenerating || !data;

  const getCopyText = () => {
    if (!data) return '';
    if (agentId === 'emails') {
      return `Sponsor:\n${data.sponsor}\n\nCollege:\n${data.college_announcement}\n\nSpeaker:\n${data.speaker_invite}`;
    }
    if (agentId === 'ideas') {
      return data.ideas.join('\n\n');
    }
    if (agentId === 'checklist') {
      return data.checklist.map(c => `# ${c.week}\n${c.tasks.map(t => '- [ ] ' + t).join('\n')}`).join('\n\n');
    }
    return JSON.stringify(data, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (agentId === 'emails') {
      return (
        <div className="space-y-6">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="bg-[#1a1a1f] p-3 rounded-lg border border-[#2a2a33]">
              <div className="text-xs text-accent uppercase tracking-wider font-bold mb-2 break-all">{key.replace('_', ' ')}</div>
              <div className="text-sm whitespace-pre-wrap">{String(val).trim()}</div>
            </div>
          ))}
        </div>
      );
    }
    if (agentId === 'ideas') {
      return (
        <ul className="space-y-4">
          {data.ideas.map((idea, i) => (
             <li key={i} className="flex gap-3 text-sm leading-relaxed p-3 rounded-lg bg-gradient-to-r from-[#2a2a33]/30 to-transparent">
               <span className="text-accent font-black text-lg leading-none">{(i+1)}</span>
               <span>{idea}</span>
             </li>
          ))}
        </ul>
      );
    }
    if (agentId === 'checklist') {
      return (
        <div className="space-y-6">
          {data.checklist.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-white font-bold text-sm mb-3 border-b border-[#2a2a33] pb-1">{section.week}</h4>
              <ul className="space-y-2">
                {section.tasks.map((task, tIdx) => (
                   <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-400 group">
                      <div className="w-4 h-4 rounded border border-gray-600 mt-0.5 flex-shrink-0 group-hover:border-accent transition-colors"></div>
                      <span className="group-hover:text-gray-300 transition-colors">{task}</span>
                   </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    return <pre className="text-xs text-gray-500">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div 
      className={cn(
        "bg-card border border-[#2a2a33] rounded-2xl p-6 transition-all duration-700 shadow-lg flex flex-col h-[28rem] relative overflow-hidden slide-up-card group",
        isGenerating && "border-accent/50 shadow-[0_0_15px_rgba(79,142,247,0.15)]"
      )}
      style={{ animationDelay: `${staggerDelay}ms`, animationFillMode: 'both' }}
    >
      {isGenerating && (
         <div className="absolute inset-0 border-2 border-transparent rounded-2xl bg-gradient-to-r from-accent via-indigo-500 to-accent opacity-20 animate-[shimmer_2s_linear_infinite] pointer-events-none bg-[length:200%_auto]" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', padding: '1px' }}></div>
      )}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] -z-10 group-hover:bg-accent/10 transition-colors duration-500"></div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 text-accent relative w-full">
          {isGenerating && <span className="absolute -inset-2 bg-accent/20 rounded-full blur-xl animate-pulse"></span>}
          <div className="p-2 bg-accent/10 rounded-xl relative border border-accent/20 shadow-[0_0_15px_rgba(79,142,247,0.15)] group-hover:shadow-[0_0_20px_rgba(79,142,247,0.3)] transition-all">
            <Icon size={20} className={isGenerating ? 'animate-pulse' : ''} />
          </div>
          <h3 className="font-semibold text-gray-100 text-lg tracking-wide">{title}</h3>
        </div>
        
        <button 
          onClick={handleCopy}
          disabled={showSkeleton}
          className="text-gray-400 flex-shrink-0 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100 outline-none flex items-center justify-center"
        >
          {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
        </button>
      </div>

      <div className="flex-1 bg-[#121215] rounded-xl p-4 overflow-y-auto border border-[#2a2a33]/50 custom-scrollbar text-sm text-gray-300 relative z-0">
        {showSkeleton ? <CardSkeleton /> : renderContent()}
      </div>
    </div>
  );
};
