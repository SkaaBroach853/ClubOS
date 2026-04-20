import React, { useState, useEffect, useRef } from 'react';
import { Timer, Plus, Trash2, Maximize, Share2, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TimerBoard = ({ onShowToast }) => {
  const [stages, setStages] = useState([{ id: 1, name: 'Registration', min: '30', sec: '00' }]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check URL hash for shared states
    if (window.location.hash.includes('timer=')) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(window.location.hash.split('timer=')[1])));
        if (Array.isArray(decoded)) setStages(decoded);
      } catch (e) {}
    }
  }, []);

  const addStage = () => setStages(p => [...p, { id: Date.now(), name: 'New Stage', min: '15', sec: '00' }]);
  const removeStage = (id) => setStages(p => p.filter(s => s.id !== id));
  
  const updateStage = (id, field, val) => {
    setStages(p => p.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const startFullscreen = async () => {
    if(!containerRef.current) return;
    try {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch(e) {
      onShowToast("Fullscreen denied by browser", "error");
    }
  };

  const handleShare = () => {
    const hash = `timer=${encodeURIComponent(btoa(JSON.stringify(stages)))}`;
    const url = window.location.origin + window.location.pathname + '#' + hash;
    navigator.clipboard.writeText(url);
    onShowToast("URL copied to clipboard!");
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 sm:p-10 shadow-xl slide-up-card min-h-[600px] max-w-4xl mx-auto w-full relative">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Timer className="text-accent" size={28}/> Stage Timer Manager</h2>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-3 mb-6">
        {stages.map((st, i) => (
           <div key={st.id} className="flex items-center gap-3 bg-[#121215] border border-[#2a2a33] p-3 rounded-xl">
             <div className="font-bold text-gray-500 w-8 text-center">{i+1}</div>
             <input value={st.name} onChange={e=>updateStage(st.id, 'name', e.target.value)} placeholder="Stage Name" className="flex-1 bg-black border border-[#2a2a33] p-2 rounded text-white font-medium outline-none focus:border-accent" />
             <input type="number" min="0" value={st.min} onChange={e=>updateStage(st.id, 'min', e.target.value)} className="w-16 bg-black border border-[#2a2a33] p-2 rounded text-white text-center font-mono outline-none" />
             <span className="text-gray-500 font-bold">:</span>
             <input type="number" min="0" max="59" value={st.sec} onChange={e=>updateStage(st.id, 'sec', e.target.value)} className="w-16 bg-black border border-[#2a2a33] p-2 rounded text-white text-center font-mono outline-none" />
             <button onClick={() => removeStage(st.id)} className="text-red-500/50 hover:text-red-500 p-2"><Trash2 size={18}/></button>
           </div>
        ))}
        <button onClick={addStage} className="w-full py-4 border-2 border-dashed border-[#2a2a33] hover:border-accent rounded-xl text-gray-400 hover:text-accent font-bold flex items-center justify-center gap-2 transition">
          <Plus size={18}/> Add Stage
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
         <button onClick={handleShare} className="py-4 bg-[#121215] border border-[#2a2a33] hover:bg-[#1a1a1f] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"><Share2 size={18}/> Share Config</button>
         <button onClick={startFullscreen} disabled={stages.length===0} className="py-4 bg-accent hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"><Maximize size={18}/> Launch Timer</button>
      </div>

      <div ref={containerRef} className={cn("hidden bg-black fixed inset-0 z-[9999] text-white flex-col", isFullscreen && "!flex")}>
         {isFullscreen && <ActiveTimerDisplay stages={stages} onClose={() => document.exitFullscreen()} />}
      </div>
    </div>
  );
};

const ActiveTimerDisplay = ({ stages, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const canvasRef = useRef(null);

  const getStageSeconds = (st) => (parseInt(st.min||0)*60) + parseInt(st.sec||0);

  useEffect(() => {
    if(stages[currentIdx]) setTimeLeft(getStageSeconds(stages[currentIdx]));
  }, [currentIdx, stages]);

  // playBeep must be declared before handleTimeUp since handleTimeUp calls it
  const playBeep = () => {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, actx.currentTime);
      osc.connect(actx.destination);
      osc.start(); osc.stop(actx.currentTime + 0.3);
    } catch(_e){}
  };

  // handleTimeUp calls playBeep, so declared second
  const handleTimeUp = () => {
    setIsActive(false);
    playBeep();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 3000);
    
    setTimeout(() => {
      if(currentIdx < stages.length - 1) {
        setCurrentIdx(p => p + 1);
        setIsActive(true);
      } else {
        setIsComplete(true);
        triggerConfetti(canvasRef.current);
      }
    }, 3000);
  };

  useEffect(() => {
    let intv;
    if(isActive && timeLeft > 0) {
      intv = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(intv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);


  const formatT = (t) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalS = stages[currentIdx] ? getStageSeconds(stages[currentIdx]) : 1;
  const perc = Math.max(0, 100 - (timeLeft / totalS) * 100);

  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative bg-black select-none">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        <h1 className="text-8xl font-black text-green-500 mb-8 animate-in zoom-in slide-in-from-bottom-10">Event Complete!</h1>
        <button onClick={onClose} className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-xl font-bold uppercase tracking-widest text-white transition">Exit</button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 relative bg-black select-none transition-colors duration-100", isFlashing && "bg-red-500")}>
      
      <div className="flex-1 flex flex-col items-center justify-center px-10">
         <h1 className={cn("font-black text-white text-center mb-10 tracking-tight", isFlashing ? "text-7xl" : "text-[min(8vw,80px)]")}>
           {stages[currentIdx]?.name}
         </h1>
         <div className="font-mono text-[min(15vw,220px)] leading-none text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{fontVariantNumeric: 'tabular-nums'}}>
           {formatT(timeLeft)}
         </div>
      </div>

      <div className="w-[400px] border-l border-white/10 flex flex-col pt-10">
         <div className="px-8 pb-4 text-xs uppercase tracking-widest text-white/50 font-bold border-b border-white/5">Run of Show</div>
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {stages.map((st, i) => (
              <div key={st.id} className={cn("p-4 rounded-xl flex items-center justify-between border", i === currentIdx ? "bg-white text-black border-white" : i < currentIdx ? "text-white/30 border-transparent bg-white/5" : "text-white/60 border-transparent bg-white/5")}>
                 <span className="font-bold text-lg max-w-[200px] truncate">{st.name}</span>
                 <span className="font-mono">{st.min.padStart(2,'0')}:{st.sec.padStart(2,'0')}</span>
              </div>
            ))}
         </div>

         <div className="p-6 bg-white/5 backdrop-blur-md pb-12 grid grid-cols-3 gap-3">
            <button onClick={() => setIsActive(!isActive)} className="py-4 rounded-xl bg-white text-black flex items-center justify-center font-bold">{isActive ? <Pause size={24}/> : <Play size={24}/>}</button>
            <button onClick={() => setTimeLeft(totalS)} className="py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"><RotateCcw size={24}/></button>
            <button onClick={() => { if(currentIdx < stages.length-1) { setCurrentIdx(p=>p+1); setIsActive(true); } else setIsComplete(true); }} className="py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"><SkipForward size={24}/></button>
         </div>
      </div>

      {/* Progress string bottom */}
      <div className="absolute bottom-0 left-0 right-[400px] h-3 bg-white/10">
         <div className="h-full bg-accent transition-all duration-1000 ease-linear" style={{ width: `${perc}%` }}></div>
      </div>

    </div>
  );
};

const triggerConfetti = (canvas) => {
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const w = canvas.width, h = canvas.height;
  const pieces = Array.from({length: 150}, () => ({
     x: w/2, y: h/2 + 200, 
     vx: (Math.random()-0.5)*20, vy: (Math.random()-1)*20 - 10,
     size: Math.random()*10+5, color: ['#4f8ef7','#10b981','#f59e0b','#ec4899','#8b5cf6'][Math.floor(Math.random()*5)],
     rot: Math.random()*360, rotSpeed: (Math.random()-0.5)*10
  }));
  let req;
  const draw = () => {
    ctx.clearRect(0,0,w,h);
    let active = false;
    pieces.forEach(p => {
       p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.rot += p.rotSpeed;
       if(p.y < h + 50) active = true;
       ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot*Math.PI/180);
       ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
    });
    if(active) req = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(req);
};
