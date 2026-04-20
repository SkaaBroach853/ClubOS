import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Terminal, Zap, Sparkles, Settings as SettingsIcon, Trash2, Hexagon, Wand2, GraduationCap, Copy, Hammer, Gamepad2 } from 'lucide-react';
import { SettingsPanel } from './components/SettingsPanel';
import { SocialMediaCard } from './components/SocialMediaCard';
import { PresentationCard } from './components/PresentationCard';
import { OutputCard } from './components/OutputCard';
import { FlyerCard } from './components/FlyerCard';
import { ContentCalendar } from './components/ContentCalendar';
import { CertificateStudio } from './components/CertificateStudio';
import { ClubTools } from './components/ClubTools';
import { Games } from './components/Games';
import { generateAgentContent, AGENTS } from './services/gemini';
import { Mail, Lightbulb, ListChecks, Image as ImageIcon } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible }) => (
  <div className={`fixed bottom-16 right-8 z-50 transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}> 
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border ${type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}> 
      <CheckCircle2 size={18} className={type === 'error' ? 'hidden' : 'block'} />
      <span className="font-medium text-sm">{message}</span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'certstudio' | 'tools' | 'games'
  
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customAgents, setCustomAgents] = useState([]);
  const [settings, setSettings] = useState({
    apiKey: '',
    certFlowUrl: 'http://127.0.0.1:5000',
    agents: { social: true, presentation: true, emails: true, ideas: true, checklist: true, flyer: true },
    customAgents: {}
  });

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Extracted brief for Cert Studio
  const [eventNameBrief, setEventNameBrief] = useState('');

  useEffect(() => {
    try {
      const savedHist = localStorage.getItem('clubos_history');
      if (savedHist) setHistory(JSON.parse(savedHist));

      const caItems = localStorage.getItem('clubos_custom_agents');
      if (caItems) setCustomAgents(JSON.parse(caItems));

      const savedSettings = localStorage.getItem('clubos_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          apiKey: parsed.apiKey || '',
          certFlowUrl: parsed.certFlowUrl || 'http://127.0.0.1:5000',
          agents: parsed.agents || { social: true, presentation: true, emails: true, ideas: true, checklist: true, flyer: true },
          customAgents: parsed.customAgents || {}
        });
      }
    } catch (e) {
      console.error('Failed to parse local storage');
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('clubos_settings', JSON.stringify(newSettings));
    showToast("Settings saved!");
    setIsSettingsOpen(false);
  };

  const handleClearSettings = () => {
    const cleared = { apiKey: '', certFlowUrl: 'http://127.0.0.1:5000', agents: { social: true, presentation: true, emails: true, ideas: true, checklist: true, flyer: true }, customAgents: {} };
    setSettings(cleared);
    localStorage.removeItem('clubos_settings');
    showToast("Settings cleared!");
  };

  const handleClearAll = () => {
    setBrief('');
    setHasGenerated(false);
    setResponses({});
    setErrors({});
  };

  const autofillEventName = () => {
    if (!brief.trim()) {
      showToast("Event brief is empty. Type something in Generator first.", "error");
      return;
    }
    const words = brief.trim().split(/\s+/).slice(0, 5).join(' ');
    setEventNameBrief(words);
    showToast("Event name autofilled!");
  };

  const regenerateFlyer = async () => {
    const flyerConfig = AGENTS.flyer;
    setIsGenerating(true);
    try {
      const res = await generateAgentContent(flyerConfig, brief, settings.apiKey || import.meta.env.VITE_GEMINI_API_KEY);
      setResponses(prev => ({ ...prev, flyer: res }));
      setErrors(prev => { const newE = {...prev}; delete newE.flyer; return newE; });
      showToast("Flyer regenerated!");
    } catch (error) {
      setErrors(prev => ({ ...prev, flyer: "Failed to regenerate flyer" }));
      showToast("Flyer generation failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    
    const keyToUse = settings.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!keyToUse) {
      showToast("No API key found. Add your Gemini key in Settings ⚙️", 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setHasGenerated(true);
    setResponses({});
    setErrors({});
    
    const newEntry = brief.trim();
    if (history[0] !== newEntry) {
      const newHistory = [newEntry, ...history].slice(0, 3);
      setHistory(newHistory);
      localStorage.setItem('clubos_history', JSON.stringify(newHistory));
    }
    
    const activeDefaultAgents = Object.keys(settings.agents).filter(key => settings.agents[key]).map(k => AGENTS[k]);
    const activeCustomAgents = customAgents.filter(ca => settings.customAgents[ca.id]);
    const allActiveAgents = [...activeDefaultAgents, ...activeCustomAgents];
    
    try {
      const promises = allActiveAgents.map(async (agentConfig, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 700));
        try {
          const res = await generateAgentContent(agentConfig, brief, keyToUse);
          return { agentId: agentConfig.id, data: res };
        } catch (err) {
          console.error(`Failed to generate for ${agentConfig.id}`, err);
          // Retry once after 2 seconds on failure
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const res = await generateAgentContent(agentConfig, brief, keyToUse);
            return { agentId: agentConfig.id, data: res };
          } catch (retryErr) {
            return { agentId: agentConfig.id, error: retryErr.message || "Failed to generate" };
          }
        }
      });

      const results = await Promise.all(promises);
      
      const newResponses = {};
      const newErrors = {};
      
      results.forEach((res) => {
        if (res.error) {
          newErrors[res.agentId] = res.error;
        } else {
          newResponses[res.agentId] = res.data;
        }
      });

      setResponses(newResponses);
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        showToast("Generated with some errors. See cards.", 'error');
      } else {
        const count = allActiveAgents.length;
        showToast(count > 0 ? `${count} agent${count > 1 ? 's' : ''} done!` : "No agents enabled!");
      }
    } catch (error) {
      showToast("Critical error during generation.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const defaultCardConfig = [
    { id: 'social', Component: SocialMediaCard, title: "Social Media", icon: null },
    { id: 'presentation', Component: PresentationCard, title: "Presentation Outline", icon: null },
    { id: 'emails', Component: OutputCard, title: "Outreach Emails", icon: Mail },
    { id: 'ideas', Component: OutputCard, title: "Wild Ideas", icon: Lightbulb },
    { id: 'checklist', Component: OutputCard, title: "Ops Checklist", icon: ListChecks },
    { id: 'flyer', Component: FlyerCard, title: "Flyer Generator", icon: ImageIcon }
  ];
  
  const activeCardsInfo = defaultCardConfig.filter(c => settings.agents[c.id]);
  
  const activeCustomCardsInfo = customAgents
    .filter(ca => settings.customAgents[ca.id])
    .map(ca => ({
       id: ca.id,
       Component: OutputCard,
       title: ca.title + " (Custom)",
       icon: Hexagon,
       isCustom: true
    }));

  const allCards = [...activeCardsInfo, ...activeCustomCardsInfo];
  const apiKeyToPass = settings.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="min-h-screen flex bg-background text-gray-100 font-sans selection:bg-accent/30 overflow-hidden relative">
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} />
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClear={handleClearSettings}
        customAgents={customAgents}
        setCustomAgents={setCustomAgents}
        onShowToast={showToast}
        onTestConnection={() => {}}
      />

      <aside className="w-64 border-r border-[#2a2a33] hidden md:flex flex-col bg-[#0b0b0e] relative z-20">
        <div className="p-6 border-b border-[#2a2a33]">
          <div className="flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-wider">
            <Clock size={16} />
            <span>History</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 px-4 overflow-y-auto custom-scrollbar pb-16">
          {history.length === 0 ? (
            <div className="text-sm text-gray-600 px-2 italic text-center mt-6">No briefs yet</div>
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => (
                <button key={i} onClick={() => { setActiveTab('generator'); setBrief(item); }} className="w-full text-left p-3 rounded-xl hover:bg-white/[0.04] transition-all text-sm text-gray-300 line-clamp-3 hover:text-white border border-transparent hover:border-[#2a2a33]">
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen relative z-10 w-full overflow-hidden">
        
        <header className="border-b border-[#2a2a33] bg-[#0b0b0e]/90 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex flex-col xl:flex-row items-center justify-between shadow-sm gap-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-accent to-indigo-500 text-white p-2 rounded-lg shadow-[0_0_15px_rgba(79,142,247,0.4)]">
                <Terminal size={22} className="relative z-10" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white hidden md:block">ClubOS</h1>
            </div>

            <div className="flex bg-[#121215] border border-[#2a2a33] p-1 rounded-lg">
               <button onClick={() => setActiveTab('generator')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition whitespace-nowrap ${activeTab === 'generator' ? 'bg-[#2a2a33] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                  <Wand2 size={16} /> Event Generator
               </button>
               <button onClick={() => setActiveTab('tools')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition whitespace-nowrap ${activeTab === 'tools' ? 'bg-[#2a2a33] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                  <Hammer size={16} /> Club Tools
               </button>
               <button onClick={() => setActiveTab('certstudio')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition whitespace-nowrap ${activeTab === 'certstudio' ? 'bg-[#2a2a33] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                  <GraduationCap size={16} /> Certificate Studio
               </button>
               <button onClick={() => setActiveTab('games')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition whitespace-nowrap ${activeTab === 'games' ? 'bg-[#2a2a33] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                  <Gamepad2 size={16} /> Games
               </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {activeTab === 'certstudio' && brief && (
               <button onClick={autofillEventName} className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition">
                 <Copy size={14} /> Auto-fill brief Event Name
               </button>
            )}
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400 hover:text-white bg-[#16161a] border border-[#2a2a33] rounded-full transition-colors hover:border-accent shadow-lg px-4 flex items-center gap-2">
              <SettingsIcon size={18} /> <span className="text-xs font-semibold">Settings</span>
            </button>
          </div>
        </header>

        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-10 custom-scrollbar pb-[60px]">
          
          {activeTab === 'generator' && (
             <div className="max-w-7xl mx-auto space-y-12 flex flex-col min-h-full slide-up-card">
               <section className="relative group max-w-4xl mx-auto w-full">
                 <div className="absolute -inset-[2px] bg-gradient-to-r from-accent via-indigo-600 to-accent rounded-3xl opacity-20 group-focus-within:opacity-100 group-focus-within:animate-[shimmer_3s_linear_infinite] blur-md transition-opacity duration-500 bg-[length:200%_auto]"></div>
                 
                 <div className="relative bg-[#16161a] rounded-3xl overflow-hidden shadow-2xl border border-[#2a2a33]/80 group-focus-within:border-accent/50 transition-colors">
                   <textarea
                     value={brief}
                     onChange={(e) => setBrief(e.target.value)}
                     placeholder="Describe your event... e.g. Tech hackathon on May 10th, 80 students, prizes worth ₹50,000, sponsors needed"
                     className="w-full h-40 bg-transparent text-white placeholder-gray-500 p-6 sm:p-8 resize-none focus:outline-none text-lg lg:text-xl leading-relaxed custom-scrollbar font-medium"
                   />
                   
                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-[#16161a]/95 border-t border-[#2a2a33]/50 gap-4">
                     <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                       <div className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap">
                         <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                         {allCards.length} Agents Ready
                       </div>
                       {hasGenerated && (
                         <button onClick={handleClearAll} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors font-medium ml-2 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 whitespace-nowrap">
                           <Trash2 size={14} /> Clear All
                         </button>
                       )}
                     </div>
                     
                     <button onClick={handleGenerate} disabled={isGenerating || !brief.trim() || allCards.length === 0} className="relative w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-[#5c98f8] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group/btn overflow-hidden shadow-[0_0_20px_rgba(79,142,247,0.3)] hover:shadow-[0_0_30px_rgba(79,142,247,0.5)] flex-shrink-0">
                       <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                       {isGenerating ? (<><Zap size={20} className="animate-spin" />Generating...</>) : (<>Generate Everything<Zap size={20} /></>)}
                     </button>
                   </div>
                 </div>
               </section>

               {hasGenerated && allCards.length > 0 && (
                 <section className="space-y-8 flex-1 w-full max-w-7xl mx-auto">
                   <div className="flex items-center justify-center gap-3 text-accent font-medium text-sm bg-accent/5 py-2 px-6 rounded-full w-max mx-auto border border-accent/10">
                     {isGenerating ? (
                       <>
                         <div className="flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                         <span className="tracking-wide text-accent font-semibold">{allCards.length} agents running in parallel...</span>
                       </>
                     ) : (
                       <div className="flex items-center gap-2 text-green-400">
                         <CheckCircle2 size={16} />
                         <span className="tracking-wide">Generation complete</span>
                       </div>
                     )}
                   </div>

                   <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                       {allCards.map((card, index) => (
                          <div key={card.id + (isGenerating ? '_gen' : '')} className="break-inside-avoid">
                            <card.Component 
                              agentId={card.id}
                              title={card.title}
                              icon={card.icon}
                              data={responses[card.id]}
                              isGenerating={isGenerating}
                              staggerDelay={index * 100}
                              userKey={apiKeyToPass}
                              eventNameBrief={brief.split(' ').slice(0, 3).join('_')}
                              onRegenerate={card.id === 'flyer' ? regenerateFlyer : null}
                            />
                          </div>
                       ))}
                   </div>
                 </section>
               )}

               <section className="w-full max-w-7xl mx-auto pt-10 mt-10 border-t border-[#2a2a33]/50">
                  <ContentCalendar userKey={apiKeyToPass} onShowToast={showToast} />
               </section>
             </div>
          )}

          {activeTab === 'certstudio' && (
             <CertificateStudio settings={settings} onShowToast={showToast} eventNameBrief={eventNameBrief} />
          )}

          {activeTab === 'tools' && (
             <ClubTools userKey={apiKeyToPass} onShowToast={showToast} />
          )}

          {activeTab === 'games' && (
             <Games onShowToast={showToast} />
          )}

        </main>
        
        {/* Universal Footer */}
        <footer className="fixed bottom-0 left-0 right-0 w-full bg-[#0b0b0e] border-t-[0.5px] border-[#2a2a33] py-3 z-50 flex items-center justify-center pointer-events-none">
           <div className="text-[13px] text-gray-500 flex items-center gap-2 pointer-events-auto">
              Built by <span className="bg-accent text-white rounded-md px-2 py-[2px] font-medium tracking-wide">AD</span> Studio
           </div>
        </footer>

      </div>
    </div>
  );
}
