import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, Trash2, CheckCircle2, Settings as SettingsIcon, Plus, Edit2, Hexagon, GraduationCap, Link2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENTS } from '../services/gemini';

export const SettingsPanel = ({ isOpen, onClose, settings, onSave, onClear, customAgents, setCustomAgents, onTestConnection: _onTestConnection, onShowToast }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [agents, setAgents] = useState({});
  const [customAgentsState, setCustomAgentsState] = useState({});
  
  const [certFlowUrl, setCertFlowUrl] = useState('http://127.0.0.1:5000');

  // Custom Agent Form
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [caName, setCaName] = useState('');
  const [caSystem, setCaSystem] = useState('');
  const [caFormat, setCaFormat] = useState('');
  const [caColor, setCaColor] = useState('#4f8ef7');

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setCertFlowUrl(settings.certFlowUrl || 'http://127.0.0.1:5000');
      
      const defaultAgents = {};
      Object.keys(AGENTS).forEach(k => {
        defaultAgents[k] = settings.agents?.[k] ?? true;
      });
      setAgents(defaultAgents);

      const savedCaState = {};
      customAgents.forEach(ca => {
        savedCaState[ca.id] = settings.customAgents?.[ca.id] ?? true;
      });
      setCustomAgentsState(savedCaState);
    }
  }, [isOpen, settings, customAgents]);

  const handleSave = () => {
    onSave({ apiKey, agents, customAgents: customAgentsState, certFlowUrl });
  };

  const handleClear = () => {
    setApiKey('');
    setCertFlowUrl('http://127.0.0.1:5000');
    const newA = {}; Object.keys(AGENTS).forEach(k => newA[k] = true);
    setAgents(newA);
    const newC = {}; customAgents.forEach(c => newC[c.id] = true);
    setCustomAgentsState(newC);
    onClear();
  };

  const toggleAgent = (key) => setAgents(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCustomAgent = (key) => setCustomAgentsState(prev => ({ ...prev, [key]: !prev[key] }));

  // Custom Agent actions
  const saveCustomAgent = () => {
    if (!caName || !caSystem) return;
    
    const newCa = {
      id: editingId || 'ca_' + Date.now(),
      title: caName,
      system: caSystem,
      format: caFormat,
      color: caColor
    };

    let updatedList;
    if (editingId) {
      updatedList = customAgents.map(ca => ca.id === editingId ? newCa : ca);
    } else {
      updatedList = [...customAgents, newCa];
    }

    setCustomAgents(updatedList);
    setCustomAgentsState(prev => ({ ...prev, [newCa.id]: true }));
    localStorage.setItem('clubos_custom_agents', JSON.stringify(updatedList));
    
    setIsCreating(false);
    setEditingId(null);
    setCaName(''); setCaSystem(''); setCaFormat(''); setCaColor('#4f8ef7');
  };

  const editCustomAgent = (ca) => {
    setEditingId(ca.id);
    setCaName(ca.title);
    setCaSystem(ca.system);
    setCaFormat(ca.format || '');
    setCaColor(ca.color || '#4f8ef7');
    setIsCreating(true);
  };

  const deleteCustomAgent = (id) => {
    const updated = customAgents.filter(ca => ca.id !== id);
    setCustomAgents(updated);
    localStorage.setItem('clubos_custom_agents', JSON.stringify(updated));
  };

  const loadTemplate = (type) => {
    setIsCreating(true);
    setEditingId(null);
    if (type === 'sponsor') {
      setCaName('Sponsorship Deck');
      setCaSystem('You are a corporate sponsorship manager. Given an event brief, return EXACTLY this JSON: { "pitch": "...", "tiers": [{"name":"Gold", "price":"...", "benefits":["..."]}], "contact": "..." }. Return ONLY JSON.');
      setCaFormat('JSON');
      setCaColor('#fbbf24');
    } else if (type === 'budget') {
      setCaName('Budget Planner');
      setCaSystem('You are a financial planner. Given an event brief, return EXACTLY this JSON: { "total_estimate": "...", "line_items": [{"category": "...", "cost": "...", "notes": "..."}] }. Return ONLY JSON.');
      setCaFormat('JSON Table');
      setCaColor('#10b981');
    } else if (type === 'report') {
      setCaName('Post-Event Report');
      setCaSystem('You are an operational reviewer. Given an event brief, return EXACTLY this JSON: { "summary": "...", "success_metrics": ["..."], "learnings": ["..."] }. Return ONLY JSON.');
      setCaFormat('JSON Summary');
      setCaColor('#8b5cf6');
    }
  };

  const clearGmailCreds = () => {
    localStorage.removeItem('clubos_gmail');
    onShowToast?.("Gmail credentials cleared");
  };

  const internalTestConnection = async () => {
    try {
      let base = certFlowUrl;
      if (!base || base === 'http://127.0.0.1:5000') {
        base = '/cert-api';
      } else {
        if (base.endsWith('/')) base = base.slice(0, -1);
      }
      const res = await fetch(`${base}/`);
      if (res.ok) onShowToast?.("✅ Connection successful!");
      else onShowToast?.("❌ Server returned error.", "error");
    } catch {
      onShowToast?.("❌ Cannot connect to CertFlow server.", "error");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      )}

      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-[#0b0b0e] border-l border-[#2a2a33] z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a33] shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-400" />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-24">
          
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">API Keys</h3>
              {settings.apiKey && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                  <CheckCircle2 size={12} /> Key saved
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-[#16161a] border border-[#2a2a33] text-white p-3 pr-10 rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg">
                <Save size={16} /> Save All Settings
              </button>
              <button onClick={handleClear} className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center font-semibold text-sm">
                <Trash2 size={16} /> Reset
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-2">
              <GraduationCap size={16} /> 🎓 Certificate Studio
            </h3>
            
            <div className="space-y-4 bg-[#16161a] p-4 border border-[#2a2a33] rounded-xl">
              <div>
                <label className="text-xs text-gray-400 block mb-1">CertFlow Server URL</label>
                <input value={certFlowUrl} onChange={e=>setCertFlowUrl(e.target.value)} placeholder="http://127.0.0.1:5000" className="w-full bg-[#121215] border border-[#2a2a33] rounded-lg p-2.5 text-sm text-white focus:border-accent outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={internalTestConnection} className="flex-1 text-xs bg-[#2a2a33] hover:bg-[#32323d] text-white py-2 rounded-lg transition flex items-center justify-center gap-2"><Link2 size={14}/> Test Connection</button>
                <button onClick={clearGmailCreds} className="flex-1 text-xs bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition">Clear Gmail Creds</button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Agent Toggles</h3>
            <div className="space-y-3 bg-[#16161a] p-4 border border-[#2a2a33] rounded-xl">
              {Object.keys(AGENTS).map(k => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">{AGENTS[k].title}</span>
                  <button onClick={() => toggleAgent(k)} className={cn("w-10 h-5 rounded-full relative transition-colors duration-300", agents[k] ? "bg-accent" : "bg-gray-600")}>
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-300", agents[k] ? "translate-x-5" : "translate-x-1")}></div>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
              <Hexagon size={16} /> 🧪 Custom Agents (Beta)
            </h3>

            {!isCreating && (
               <button onClick={() => {setIsCreating(true); setEditingId(null); setCaName(''); setCaSystem(''); setCaFormat(''); setCaColor('#4f8ef7');}} className="w-full py-3 border border-dashed border-[#2a2a33] hover:border-accent rounded-xl text-gray-400 hover:text-white transition-colors flex justify-center items-center gap-2 text-sm">
                 <Plus size={16} /> Create New Agent
               </button>
            )}

            {isCreating && (
              <div className="bg-[#121215] border border-[#2a2a33] p-4 rounded-xl space-y-4 relative">
                <button onClick={() => setIsCreating(false)} className="absolute top-2 right-2 text-gray-500 hover:text-white"><X size={16} /></button>
                
                <h4 className="font-bold text-white text-sm">{editingId ? 'Edit Agent' : 'New Agent'}</h4>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Agent Name</label>
                  <input value={caName} onChange={e=>setCaName(e.target.value)} placeholder="e.g. Sponsorship Deck" className="w-full bg-[#16161a] border border-[#2a2a33] rounded-lg p-2 text-sm text-white focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">System Prompt</label>
                  <textarea value={caSystem} onChange={e=>setCaSystem(e.target.value)} placeholder="You are a... Given an event brief, return JSON: { ... }" className="w-full bg-[#16161a] border border-[#2a2a33] rounded-lg p-2 text-sm text-white focus:border-accent outline-none h-24 resize-none" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">Output Format hint</label>
                    <input value={caFormat} onChange={e=>setCaFormat(e.target.value)} placeholder="e.g. List of sections" className="w-full bg-[#16161a] border border-[#2a2a33] rounded-lg p-2 text-sm text-white focus:border-accent outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Accent</label>
                    <input type="color" value={caColor} onChange={e=>setCaColor(e.target.value)} className="h-9 w-12 rounded bg-transparent border-0 cursor-pointer" />
                  </div>
                </div>
                <button onClick={saveCustomAgent} className="w-full bg-accent hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold shadow-md transition-colors">
                  Save Agent
                </button>

                {!editingId && (
                  <div className="pt-3 border-t border-[#2a2a33]">
                    <span className="text-xs text-gray-500 mb-2 block">Or load a template:</span>
                    <div className="flex flex-wrap gap-2">
                       <button onClick={()=>loadTemplate('sponsor')} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300">Sponsorship Deck</button>
                       <button onClick={()=>loadTemplate('budget')} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300">Budget Planner</button>
                       <button onClick={()=>loadTemplate('report')} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300">Post-Event Report</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {customAgents.length > 0 && (
              <div className="space-y-3 bg-[#16161a] p-4 border border-[#2a2a33] rounded-xl mt-4">
                {customAgents.map(ca => (
                  <div key={ca.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: ca.color}}></div>
                       <span className="text-sm text-gray-200">{ca.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => editCustomAgent(ca)} className="text-gray-500 hover:text-white"><Edit2 size={14}/></button>
                       <button onClick={() => deleteCustomAgent(ca.id)} className="text-red-500/60 hover:text-red-500"><Trash2 size={14}/></button>
                       <button onClick={() => toggleCustomAgent(ca.id)} className={cn("w-10 h-5 rounded-full relative transition-colors duration-300 ml-2", customAgentsState[ca.id] ? "bg-accent" : "bg-gray-600")}>
                         <div className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-300", customAgentsState[ca.id] ? "translate-x-5" : "translate-x-1")}></div>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </section>

        </div>
      </div>
    </>
  );
};
