import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { generateFeedbackForm } from '../../services/gemini';
import { Zap, Download, MessageSquare, Star, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CardSkeleton } from '../CardSkeleton';

Chart.register(...registerables);

export const FeedbackForm = ({ userKey, onShowToast }) => {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Workshop');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState(null); // { form: {title, questions} }
  
  const [answers, setAnswers] = useState({});
  const [viewResponses, setViewResponses] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if(!eventName) return;
    const key = `clubos_fb_${eventName.toLowerCase().replace(/\s+/g,'_')}`;
    const saved = localStorage.getItem(key);
    if(saved) setSubmissions(JSON.parse(saved));
  }, [eventName, viewResponses]);

  const handleGenerate = async () => {
    if(!eventName) return;
    setIsGenerating(true);
    setViewResponses(false);
    try {
      const res = await generateFeedbackForm(eventName, eventType, userKey);
      if(res && res.form) {
         setData(res.form);
         setAnswers({});
      }
      onShowToast("Form Generated!");
    } catch(e) {
      onShowToast("Failed generation", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitForm = () => {
    const key = `clubos_fb_${eventName.toLowerCase().replace(/\s+/g,'_')}`;
    const newSub = { id: Date.now(), timestamp: new Date().toLocaleString(), answers };
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    saved.push(newSub);
    localStorage.setItem(key, JSON.stringify(saved));
    setSubmissions(saved);
    setAnswers({});
    onShowToast("Response submitted! 🎉");
  };

  const downloadCSV = () => {
    if(!data || submissions.length===0) return;
    const headers = ["Timestamp", ...data.questions.map(q => `"${q.text.replace(/"/g, '""')}"`)].join(',');
    const rows = submissions.map(sub => {
       return [
         `"${sub.timestamp}"`,
         ...data.questions.map(q => `"${(sub.answers[q.id] || '').toString().replace(/"/g, '""')}"`)
       ].join(',');
    }).join('\n');
    const blob = new Blob([headers+'\n'+rows], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Feedback_${eventName}.csv`; a.click();
  };

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px] max-w-5xl mx-auto w-full">
      
      <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-end gap-4 shrink-0 transition-all">
         <div className="flex-1 w-full">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Event Name</label>
          <input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. AWS Cloud Intro" className="w-full bg-[#121215] border border-[#2a2a33] p-3 rounded-lg outline-none focus:border-accent text-white" />
         </div>
         <div className="w-full sm:w-[200px]">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Type</label>
          <select value={eventType} onChange={e=>setEventType(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-3 rounded-lg outline-none focus:border-accent text-white cursor-pointer appearance-none">
             {["Workshop", "Hackathon", "Cultural Show", "Seminar"].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
         </div>
         <button onClick={handleGenerate} disabled={isGenerating||!eventName} className="w-full sm:w-auto px-6 py-[13px] bg-accent hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 h-[48px]">
           {isGenerating ? <Zap size={16} className="animate-spin" /> : <MessageSquare size={16} />} Build Form
         </button>
      </div>

      {isGenerating && <CardSkeleton />}

      {!isGenerating && data && !viewResponses && (
         <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 sm:p-10 shadow-2xl relative flex-1 min-h-[500px]">
             <h2 className="text-2xl font-black text-white mb-8 pb-4 border-b border-[#2a2a33]">{data.title}</h2>
             
             <div className="space-y-8">
               {data.questions.map((q, i) => (
                 <div key={q.id}>
                    <p className="font-bold text-gray-200 mb-4">{i+1}. {q.text}</p>
                    
                    {q.type.includes('rating') && (
                       <div className="flex gap-2">
                         {[1,2,3,4,5].map(star => (
                           <button key={star} onClick={() => setAnswers(p=>({...p, [q.id]: star}))} className={cn("p-2 rounded-full transition-transform hover:scale-110", answers[q.id] >= star ? "text-yellow-400" : "text-[#2a2a33]")}>
                              <Star size={32} fill={answers[q.id] >= star ? "currentColor" : "none"} />
                           </button>
                         ))}
                       </div>
                    )}

                    {q.type.includes('mcq') && (
                       <div className="space-y-2">
                         {q.options.map((opt, oIdx) => (
                           <label key={oIdx} className="flex items-center gap-3 p-3 rounded-lg bg-[#121215] border border-[#2a2a33] cursor-pointer hover:border-accent/50 transition-colors">
                              <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers(p=>({...p, [q.id]: opt}))} className="accent-accent w-4 h-4" />
                              <span className="text-sm text-gray-300">{opt}</span>
                           </label>
                         ))}
                       </div>
                    )}

                    {q.type.includes('text') && (
                       <textarea value={answers[q.id] || ''} onChange={e => setAnswers(p=>({...p, [q.id]: e.target.value}))} placeholder="Your thoughts..." rows={3} className="w-full bg-[#121215] border border-[#2a2a33] p-4 rounded-xl outline-none focus:border-accent text-sm text-white resize-none custom-scrollbar" />
                    )}
                 </div>
               ))}
             </div>

             <div className="mt-12 flex justify-between items-center pt-6 border-t border-[#2a2a33]">
                <button onClick={() => setViewResponses(true)} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 font-medium"><BarChart3 size={16}/> View Responses ({submissions.length})</button>
                <button onClick={submitForm} disabled={Object.keys(answers).length < data.questions.length} className="px-8 py-3 bg-white text-black font-bold rounded-xl shadow hover:bg-gray-200 transition disabled:opacity-50">
                  Submit Response
                </button>
             </div>
         </div>
      )}

      {viewResponses && data && (
         <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-2xl relative flex-1 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#2a2a33]">
               <div>
                  <h2 className="text-xl font-bold text-white">Responses Dashboard</h2>
                  <p className="text-gray-400 text-sm mt-1">{submissions.length} Total Submissions</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={downloadCSV} className="text-sm bg-[#2a2a33] hover:bg-[#32323d] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"><Download size={16}/> CSV EXPORT</button>
                 <button onClick={() => setViewResponses(false)} className="text-sm bg-accent hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition">Back to Form <ChevronRight size={16}/></button>
               </div>
            </div>

            {submissions.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-gray-500 italic">No responses yet.</div>
            ) : (
               <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
                 {data.questions.map((q, i) => (
                    <div key={q.id} className="bg-[#121215] border border-[#2a2a33] rounded-xl p-5">
                       <h3 className="font-bold text-gray-200 mb-4 text-sm">{q.text}</h3>
                       
                       {q.type.includes('rating') && (
                          <div className="flex items-center gap-6">
                             {(() => {
                                const avg = submissions.reduce((s, sub) => s + (sub.answers[q.id] || 0), 0) / submissions.length;
                                return (
                                  <div className="text-center shrink-0">
                                     <div className="text-4xl font-black text-yellow-400">{avg.toFixed(1)}</div>
                                     <div className="flex gap-1 mt-1 justify-center">{[1,2,3,4,5].map(s=><Star key={s} size={10} fill={avg>=s?"currentColor":avg+0.5>=s?"currentColor":"none"} className="text-yellow-400"/>)}</div>
                                     <div className="text-xs text-gray-500 mt-1">Average</div>
                                  </div>
                                )
                             })()}
                             <div className="flex-1 h-32 pl-4">
                               <RatingChart data={submissions.map(s => s.answers[q.id])} />
                             </div>
                          </div>
                       )}

                       {q.type.includes('mcq') && (
                          <div className="h-40">
                             <MCQChart options={q.options} data={submissions.map(s => s.answers[q.id])} />
                          </div>
                       )}

                       {q.type.includes('text') && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                             {submissions.filter(s => s.answers[q.id]).map((s, idx) => (
                               <div key={idx} className="bg-[#1a1a1f] p-3 rounded-lg border border-[#2a2a33]">
                                 <p className="text-sm text-gray-300 italic">"{s.answers[q.id]}"</p>
                                 <span className="text-[10px] text-gray-600 block mt-2">{s.timestamp}</span>
                               </div>
                             ))}
                          </div>
                       )}
                    </div>
                 ))}
               </div>
            )}
         </div>
      )}
    </div>
  );
};

const RatingChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInst = useRef(null);
  useEffect(() => {
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    const counts = [1,2,3,4,5].map(val => data.filter(d => parseInt(d) === val).length);
    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels: ['1★','2★','3★','4★','5★'], datasets: [{ data: counts, backgroundColor: '#facc15', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: '#6b7280' } }, x: { ticks: { color: '#9ca3af' } } }, plugins: { legend: { display: false } } }
    });
    return () => chartInst.current?.destroy();
  }, [data]);
  return <canvas ref={chartRef}></canvas>;
};

const MCQChart = ({ options, data }) => {
  const chartRef = useRef(null);
  const chartInst = useRef(null);
  useEffect(() => {
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    const counts = options.map(opt => data.filter(d => d === opt).length);
    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels: options, datasets: [{ data: counts, backgroundColor: '#4f8ef7', borderRadius: 4 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0, color: '#6b7280' } }, y: { ticks: { color: '#9ca3af' } } }, plugins: { legend: { display: false } } }
    });
    return () => chartInst.current?.destroy();
  }, [data, options]);
  return <canvas ref={chartRef}></canvas>;
};
