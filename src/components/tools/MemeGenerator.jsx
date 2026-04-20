import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Image as ImageIcon, Zap } from 'lucide-react';
import { generateMemeCaptions } from '../../services/gemini';


export const MemeGenerator = ({ userKey, onShowToast }) => {
  const [brief, setBrief] = useState('');
  const [style, setStyle] = useState('Distracted Boyfriend');
  const [isGenerating, setIsGenerating] = useState(false);
  const [memes, setMemes] = useState([]); // [{topText, bottomText, context}]

  const styles = [
    "Distracted Boyfriend", "Drake Hotline Bling", "This Is Fine", 
    "Two Buttons", "Expanding Brain", "Change My Mind", "Surprised Pikachu"
  ];

  const handleGenerate = async () => {
    if(!brief) return;
    setIsGenerating(true);
    try {
      const res = await generateMemeCaptions(brief, style, userKey);
      if(res && res.memes) {
        setMemes(res.memes);
      }
      onShowToast("Memes generated! 🚀");
    } catch(e) {
      onShowToast("Failed to generate memes", "error");
    } finally {
       setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px]">
      <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-end gap-4 shrink-0">
         <div className="flex-1 w-full">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Event Brief Context</label>
          <input value={brief} onChange={e=>setBrief(e.target.value)} placeholder="e.g. 24 hour coding hackathon, no sleep, pizza runs out fast..." className="w-full bg-[#121215] border border-[#2a2a33] p-3 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="w-full sm:w-[250px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Meme Format</label>
          <select value={style} onChange={e=>setStyle(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-3 rounded-lg outline-none focus:border-accent text-white cursor-pointer appearance-none">
             {styles.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
         </div>
         <button onClick={handleGenerate} disabled={isGenerating||!brief} className="w-full sm:w-auto px-6 py-[13px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 h-[48px]">
           {isGenerating ? <Zap size={16} className="animate-spin" /> : <ImageIcon size={16} />} Generated Memes
         </button>
      </div>

      {memes.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
            {memes.map((m, i) => (
               <MemeCanvas key={i} topText={m.topText} bottomText={m.bottomText} context={m.context} styleName={style} />
            ))}
         </div>
      )}
    </div>
  );
};

const MemeCanvas = ({ topText, bottomText, context, styleName }) => {
  const canvasRef = useRef(null);

  const getStyleGradient = (name) => {
    if(name.includes('Boyfriend')) return ['#4f8ef7', '#10b981'];
    if(name.includes('Drake')) return ['#f59e0b', '#ef4444'];
    if(name.includes('Fine')) return ['#ef4444', '#7f1d1d'];
    if(name.includes('Buttons')) return ['#ef4444', '#3b82f6'];
    if(name.includes('Brain')) return ['#8b5cf6', '#d946ef'];
    return ['#374151', '#111827'];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 500; const h = 400;
    
    // Background
    const grad = ctx.createLinearGradient(0,0,w,h);
    const colors = getStyleGradient(styleName);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    // Grid pattern faint
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<w; i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0; i<h; i+=40){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

    // Text configuration (Impact style)
    ctx.textAlign = 'center';
    ctx.font = '900 40px Impact, Arial Black, sans-serif';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    const drawTextLines = (text, yStart, isTop) => {
       const words = text.toUpperCase().split(' ');
       let line = '';
       let lines = [];
       for(let n=0; n<words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if(metrics.width > w - 40 && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
       }
       lines.push(line);

       const lh = 45;
       let yPos = isTop ? yStart : yStart - (lines.length - 1) * lh;
       
       lines.forEach((l) => {
          ctx.strokeText(l, w/2, yPos);
          ctx.fillText(l, w/2, yPos);
          yPos += lh;
       });
    };

    drawTextLines(topText, 60, true);
    drawTextLines(bottomText, h - 40, false);

  }, [topText, bottomText, styleName]);

  const handleDownload = () => {
    if(!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
       const a = document.createElement('a');
       a.href = URL.createObjectURL(blob);
       a.download = `Meme_${styleName.replace(/ /g,'_')}.png`;
       a.click();
    });
  };

  return (
    <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 shadow-xl flex flex-col group slide-up-card">
       <div className="relative rounded-xl overflow-hidden shadow-inner border border-white/5 bg-black">
          <canvas ref={canvasRef} width={500} height={400} className="w-full h-auto object-cover" />
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {styleName}
          </div>
       </div>
       <p className="text-xs text-gray-400 mt-4 mb-4 italic line-clamp-2 px-1 text-center font-medium">"{context}"</p>
       <button onClick={handleDownload} className="mt-auto w-full py-2.5 bg-[#2a2a33] hover:bg-[#32323d] text-white font-bold text-xs rounded-lg transition shadow flex items-center justify-center gap-2">
         <Download size={14}/> Download PNG
       </button>
    </div>
  );
};
