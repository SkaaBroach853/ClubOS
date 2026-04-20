import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
// removed autotable since it's not installed
import { Zap, Download, RefreshCw, BarChart2 } from 'lucide-react';
import { generateBudgetAI } from '../../services/gemini';


Chart.register(...registerables);

export const BudgetAI = ({ userKey, onShowToast }) => {
  const [amount, setAmount] = useState('50000');
  const [type, setType] = useState('Hackathon');
  const [attendees, setAttendees] = useState('100');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState(null); // { breakdown: [...] }
  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const colors = ['#4f8ef7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

  const handleGenerate = async () => {
    if (!amount || !attendees) return;
    setIsGenerating(true);
    try {
      const res = await generateBudgetAI(amount, type, attendees, userKey);
      if (res && res.breakdown) {
        setData(res);
      }
      onShowToast("Budget drafted successfully!");
    } catch (e) {
      onShowToast("Failed to generate budget", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!data?.breakdown || !chartRef.current) return;
    
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.breakdown.map(d => d.category),
        datasets: [{
          data: data.breakdown.map(d => d.amount),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'right', labels: { color: '#e5e7eb', font: { family: 'inherit', size: 11 } } }
        }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [data]);

  const updateAmount = (index, newAmountStr) => {
    const val = parseFloat(newAmountStr) || 0;
    const newData = { ...data };
    newData.breakdown[index].amount = val;
    
    const subtotal = newData.breakdown.reduce((sum, item) => sum + item.amount, 0);
    newData.breakdown.forEach(item => {
       item.percentage = ((item.amount / subtotal) * 100).toFixed(1);
    });
    
    setData(newData);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(22);
    doc.text(`Budget Plan: ${type}`, 14, 22);
    
    doc.setFontSize(14);
    const subtotal = data.breakdown.reduce((s,i)=>s+i.amount,0);
    doc.text(`Total Estimate: Rs. ${subtotal.toLocaleString()}`, 14, 32);
    doc.text(`Attendees: ${attendees}`, 14, 40);

    let y = 55;
    data.breakdown.forEach((item, i) => {
       if(y > 270) { doc.addPage(); y = 20; }
       doc.setFontSize(12);
       doc.setFont("helvetica", "bold");
       doc.text(`${item.category} - Rs. ${item.amount.toLocaleString()} (${item.percentage}%)`, 14, y);
       y += 7;
       doc.setFont("helvetica", "normal");
       doc.setFontSize(10);
       const splitText = doc.splitTextToSize(`Tips: ${item.tips}`, 180);
       doc.text(splitText, 14, y);
       y += (splitText.length * 5) + 8;
    });

    doc.save(`ClubOS_Budget_${type.replace(' ','_')}.pdf`);
  };

  const currentTotal = data?.breakdown.reduce((sum, i) => sum + i.amount, 0) || 0;

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px]">
      
      <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-end gap-4 shrink-0 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] -z-10 transition-colors"></div>
         <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Total Budget (₹)</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white font-bold" />
         </div>
         <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Event Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white cursor-pointer appearance-none">
             {["Hackathon", "Cultural Fest", "Workshop", "Sports Event", "Alumni Meet", "Custom"].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
         </div>
         <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Est. Attendees</label>
          <input type="number" value={attendees} onChange={e=>setAttendees(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-2.5 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="w-full md:w-auto">
           <button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto px-6 py-[11px] h-[44px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 disabled:opacity-50">
             {isGenerating ? <Zap size={16} className="animate-spin" /> : <BarChart2 size={16} />}
             Auto-Draft Budget
           </button>
         </div>
      </div>

      {data?.breakdown && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
           
           {/* Chart */}
           <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center relative">
              <div className="w-full h-[300px] sm:h-[400px] relative font-sans">
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-white">₹{currentTotal.toLocaleString()}</span>
                 </div>
                 <canvas ref={chartRef}></canvas>
              </div>
           </div>

           {/* Table */}
           <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl flex flex-col overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg flex items-center gap-2"><Zap className="text-yellow-400"/> Interactive Breakdown</h3>
                <div className="flex gap-2">
                   <button onClick={handleGenerate} className="text-xs bg-[#2a2a33] hover:bg-[#32323d] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition"><RefreshCw size={14} className={isGenerating?'animate-spin':''}/> AI Retry</button>
                   <button onClick={exportPDF} className="text-xs bg-accent/20 border border-accent/30 hover:bg-accent hover:text-white text-accent px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition"><Download size={14}/> PDF</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                 <div className="space-y-4">
                    {data.breakdown.map((item, idx) => (
                       <div key={idx} className="bg-[#121215] border border-[#2a2a33] p-4 rounded-xl slide-up-card group">
                          <div className="flex items-start justify-between mb-2 gap-4">
                             <div className="flex items-center gap-3 w-1/2">
                               <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: colors[idx % colors.length]}}></div>
                               <span className="font-bold text-gray-200 text-sm truncate">{item.category}</span>
                             </div>
                             
                             <div className="flex items-center gap-2 justify-end w-1/2">
                               <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                 <input type="number" value={item.amount} onChange={e=>updateAmount(idx, e.target.value)} className="w-[100px] sm:w-[120px] bg-black border border-[#2a2a33] group-hover:border-accent/50 rounded-lg p-1.5 pl-7 text-sm text-right text-white font-mono font-bold outline-none transition-colors" />
                               </div>
                               <span className="text-xs font-bold text-gray-500 w-10 text-right">{item.percentage}%</span>
                             </div>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed italic border-t border-[#2a2a33] pt-2 mt-1">✨ {item.tips}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      )}
    </div>
  );
};
