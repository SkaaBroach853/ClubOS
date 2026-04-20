import React, { useState } from 'react';
import { ArrowLeft, QrCode, PieChart, Image as ImageIcon, Briefcase, HelpCircle, MessageSquare, Timer, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCheckIn } from './tools/QRCheckIn';
import { BudgetAI } from './tools/BudgetAI';
import { MemeGenerator } from './tools/MemeGenerator';
import { SponsorMatcher } from './tools/SponsorMatcher';
import { QuizBuilder } from './tools/QuizBuilder';
import { FeedbackForm } from './tools/FeedbackForm';
import { TimerBoard } from './tools/TimerBoard';
import { MerchStore } from './tools/MerchStore';

export const ClubTools = ({ userKey, onShowToast }) => {
  const [activeTool, setActiveTool] = useState(null);

  const toolsConfig = [
    { id: 'qr', title: 'QR Check-In', tagline: 'Generate & Scan Passes', icon: QrCode, color: 'text-blue-400', Component: QRCheckIn },
    { id: 'budget', title: 'Budget AI', tagline: 'Plan smart event budgets', icon: PieChart, color: 'text-green-400', Component: BudgetAI },
    { id: 'meme', title: 'Meme Generator', tagline: 'Viral event marketing', icon: ImageIcon, color: 'text-purple-400', Component: MemeGenerator },
    { id: 'sponsor', title: 'Sponsor Matcher', tagline: 'Targeted brand pitches', icon: Briefcase, color: 'text-yellow-400', Component: SponsorMatcher },
    { id: 'quiz', title: 'Quiz Builder', tagline: 'Interactive trivia maker', icon: HelpCircle, color: 'text-orange-400', Component: QuizBuilder },
    { id: 'feedback', title: 'Feedback Form', tagline: 'Dynamic post-event survey', icon: MessageSquare, color: 'text-pink-400', Component: FeedbackForm },
    { id: 'timer', title: 'Timer Board', tagline: 'Stage manager tools', icon: Timer, color: 'text-cyan-400', Component: TimerBoard },
    { id: 'merch', title: 'Merch Store', tagline: 'AI design templates', icon: ShoppingBag, color: 'text-red-400', Component: MerchStore }
  ];

  if (activeTool) {
    const ToolConfig = toolsConfig.find(t => t.id === activeTool);
    if(!ToolConfig) return null;
    return (
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-500 pb-16">
         <div className="flex items-center justify-between mb-8">
            <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-white flex items-center gap-2 transition bg-[#16161a] border border-[#2a2a33] px-4 py-2 rounded-lg text-sm font-semibold shadow hover:border-accent">
               <ArrowLeft size={16}/> Back to Tools
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><ToolConfig.icon size={20} className={ToolConfig.color}/> {ToolConfig.title}</h2>
         </div>
         <div className="flex-1 min-h-0">
            <ToolConfig.Component userKey={userKey} onShowToast={onShowToast} />
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-16">
      <div className="text-center space-y-4 mb-12">
         <h2 className="text-4xl font-black text-white tracking-tight">Club Tools <span className="text-accent">Arsenal</span></h2>
         <p className="text-gray-400 text-lg max-w-2xl mx-auto">8 hyper-focused AI and utility tools designed specifically to make running college clubs ridiculously easy.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {toolsConfig.map((tool, idx) => (
            <div key={tool.id} className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl hover:shadow-[0_0_20px_rgba(79,142,247,0.1)] hover:border-accent/40 transition-all group flex flex-col items-center text-center slide-up-card" style={{animationDelay: `${idx*50}ms`, animationFillMode:'both'}}>
               <div className={cn("w-16 h-16 rounded-2xl bg-black border border-[#2a2a33] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner", tool.color)}>
                  <tool.icon size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
               <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed flex-1">{tool.tagline}</p>
               <button onClick={() => setActiveTool(tool.id)} className="w-full py-3 bg-[#2a2a33] group-hover:bg-accent text-white font-bold rounded-xl transition-colors">
                  Open Tool
               </button>
            </div>
         ))}
      </div>
    </div>
  );
};
