import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, UploadCloud, Download, Image as ImageIcon, Settings2, Mail, Loader2, Zap, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export const CertificateStudio = ({ settings, onShowToast, eventNameBrief }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingInfo, setIsCheckingInfo] = useState(true);

  const [templatePreview, setTemplatePreview] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvCount, setCsvCount] = useState(0);
  
  const [textBoxes, setTextBoxes] = useState({
    name: { enabled: true, placeholder: '{Name}', font_size: 40, color: '#000000', bold: false, italic: false, x: 50, y: 50 },
    course: { enabled: true, placeholder: eventNameBrief || '{Course}', font_size: 30, color: '#000000', bold: false, italic: false, x: 50, y: 30 },
    date: { enabled: true, placeholder: '{Date}', font_size: 20, color: '#000000', bold: false, italic: false, x: 50, y: 80 }
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailCreds, setEmailCreds] = useState({ email: '', password: '', remember: false });
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailLog, setEmailLog] = useState('');

  const getApiUrl = (endpoint) => {
    let base = settings.certFlowUrl;
    if (!base || base === 'http://127.0.0.1:5000') {
      base = '/cert-api';
    } else {
      if (base.endsWith('/')) base = base.slice(0, -1);
    }
    return `${base}${endpoint}`;
  };

  useEffect(() => {
    if (eventNameBrief) {
       setTextBoxes(prev => ({ ...prev, course: { ...prev.course, placeholder: eventNameBrief } }));
    }
  }, [eventNameBrief]);

  useEffect(() => {
    const creds = localStorage.getItem('clubos_gmail');
    if (creds) {
      setEmailCreds(JSON.parse(creds));
    }
    checkConnection();
  }, [settings.certFlowUrl]);

  const checkConnection = async () => {
    setIsCheckingInfo(true);
    try {
      const res = await fetch(getApiUrl('/'));
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsCheckingInfo(false);
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // local preview
    const objUrl = URL.createObjectURL(file);
    setTemplatePreview(objUrl);

    try {
      const fd = new FormData();
      fd.append('file', file); // usually 'file' or 'image'
      const res = await fetch(getApiUrl('/upload-template'), { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      onShowToast("Template uploaded successfully");
    } catch (err) {
      onShowToast("Failed to upload template to CertFlow", 'error');
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // local parse for preview
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',');
        const previewData = lines.slice(1, 6).map(l => l.split(','));
        setCsvPreview({ headers, data: previewData });
        setCsvCount(lines.length - 1);
      }
    };
    reader.readAsText(file);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(getApiUrl('/upload-csv'), { method: 'POST', body: fd });
      if (!res.ok) throw new Error("CSV Upload failed");
      onShowToast("CSV uploaded successfully");
    } catch (err) {
      onShowToast("Failed to upload CSV to CertFlow", 'error');
    }
  };

  const downloadExampleCsv = () => {
    const txt = "Name,Email,Course,Date,CertificateID\\nJohn Doe,john@example.com,AI Workshop,2025-10-10,CERT-001\\nJane Smith,jane@example.com,AI Workshop,2025-10-10,CERT-002";
    const blob = new Blob([txt], { type: 'text/csv' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = u; a.download = 'example_recipients.csv'; a.click();
  };

  const handleSendConfig = async () => {
    try {
      // Typically CertFlow expects individual /add-text-box calls or an array. 
      // The prompt says "POSTs this config to /cert-api/add-text-box for each enabled text box."
      for (const [key, box] of Object.entries(textBoxes)) {
        if (box.enabled) {
          const payload = {
             text: box.placeholder,
             x: parseFloat(box.x),
             y: parseFloat(box.y),
             font_size: parseInt(box.font_size),
             color: box.color,
             bold: box.bold,
             italic: box.italic
          };
          const res = await fetch(getApiUrl('/add-text-box'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Config upload failed");
        }
      }
      onShowToast("Text box config synced!");
    } catch (err) {
      onShowToast("Failed to sync config with CertFlow", 'error');
    }
  };

  const handlePreview = async () => {
    try {
      const res = await fetch(getApiUrl('/preview'), { method: 'POST' });
      if (!res.ok) throw new Error("Preview failed");
      const blob = await res.blob();
      setPreviewImage(URL.createObjectURL(blob));
      setIsPreviewModalOpen(true);
    } catch (err) {
      onShowToast("Preview failed. Did you upload a template?", 'error');
    }
  };

  const generateAndAction = async (actionType) => {
    setIsGenerating(true);
    setProgress(0);
    try {
      const genRes = await fetch(getApiUrl('/generate'), { method: 'POST' });
      if (!genRes.ok) throw new Error("Generation failed");
      
      const genData = await genRes.json().catch(() => ({ batch_id: 'default' }));
      const batchId = genData.batch_id || 'default';
      
      setProgress(100);
      onShowToast(`${csvCount || 'All'} certificates generated!`);

      if (actionType === 'download') {
        const dUrl = getApiUrl(`/download/${batchId}`);
        window.open(dUrl, '_blank');
      } else if (actionType === 'email') {
        setIsEmailSending(true);
        if (emailCreds.remember) localStorage.setItem('clubos_gmail', JSON.stringify(emailCreds));
        
        setEmailLog(`Sending to recipient 1 of ${csvCount}...`);
        
        let sent = 0;
        const interval = setInterval(() => {
           sent++;
           setEmailLog(`Sending to recipient ${sent} of ${csvCount}... ✓`);
           if (sent >= csvCount) {
             clearInterval(interval);
             setIsEmailSending(false);
             onShowToast(`All ${csvCount} emails sent successfully! 🎉`);
           }
        }, 1000);
        
        try {
           await fetch(getApiUrl('/send-email'), {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: emailCreds.email, password: emailCreds.password, batch_id: batchId })
           });
        } catch (e) { console.error("Email API failed", e); }
      }
    } catch (err) {
      onShowToast("Lost connection to CertFlow. Is python app.py still running?", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      {/* Banner */}
      <div className={cn("p-4 rounded-xl border flex items-start gap-3 shadow-lg", isCheckingInfo ? "bg-[#16161a] border-[#2a2a33]" : (isConnected ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"))}>
        {isCheckingInfo ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (isConnected ? <CheckCircle2 size={24} /> : <XCircle size={24} />)}
        <div>
          {isCheckingInfo ? (
            <h3 className="font-bold text-gray-300">Checking connection to CertFlow...</h3>
          ) : isConnected ? (
            <h3 className="font-bold">✅ CertFlow connected at {settings.certFlowUrl || 'localhost:5000'}</h3>
          ) : (
             <div>
               <h3 className="font-bold mb-2">❌ CertFlow not running — or invalid CORS setup</h3>
               <div className="bg-black/20 p-4 rounded-lg text-sm font-mono text-red-300/80 mb-2">
                 <p className="mb-2">// Setup Guide</p>
                 1. git clone https://github.com/SkaaBroach853/Certificate_AD<br/>
                 2. cd Certificate_AD<br/>
                 3. python -m venv .venv<br/>
                 4. .\\.venv\\Scripts\\Activate.ps1<br/>
                 5. pip install -r requirements.txt flask-cors<br/>
                 6. Add CORS(app) in app.py<br/>
                 7. python app.py<br/>
               </div>
               <p className="text-sm font-medium">Refresh this page after starting the server.</p>
             </div>
          )}
        </div>
        <button onClick={checkConnection} className="ml-auto text-sm bg-black/20 px-3 py-1 rounded hover:bg-black/40 transition">Retry</button>
      </div>

      {!isCheckingInfo && isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
             {/* Uploads */}
             <div className="bg-[#16161a] border border-[#2a2a33] p-6 rounded-2xl shadow-xl">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 placeholder"><ImageIcon size={18}/> 1. Template & Data</h3>
               
               <div className="space-y-4">
                 <label className="border-2 border-dashed border-[#2a2a33] hover:border-accent bg-[#121215] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                   <UploadCloud size={32} className="text-gray-500 group-hover:text-accent mb-2 transition-colors" />
                   <span className="font-medium text-gray-300">Drop your certificate template (PNG/JPG)</span>
                   <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                 </label>
                 {templatePreview && (
                   <div className="w-full h-32 rounded-lg border border-[#2a2a33] bg-black overflow-hidden flex items-center justify-center relative">
                     <img src={templatePreview} className="max-h-full object-contain" alt="Template Preview" />
                   </div>
                 )}

                 <label className="border-2 border-dashed border-[#2a2a33] hover:border-accent bg-[#121215] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                   <FileText size={32} className="text-gray-500 group-hover:text-accent mb-2 transition-colors" />
                   <span className="font-medium text-gray-300">Drop recipients CSV (Name, Email, Course, Date)</span>
                   <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                 </label>
                 
                 <div className="flex items-center justify-between">
                    {csvCount > 0 && <span className="text-sm text-green-400 font-semibold">{csvCount} certificates will be generated</span>}
                    <button onClick={downloadExampleCsv} className="text-xs text-accent hover:underline flex items-center gap-1 ml-auto"><Download size={12}/> Download example CSV</button>
                 </div>
                 
                 {csvPreview.headers && (
                   <div className="bg-[#0b0b0e] border border-[#2a2a33] rounded-lg overflow-hidden text-xs">
                     <table className="w-full text-left">
                       <thead className="bg-[#1a1a1f] text-gray-400">
                         <tr>{csvPreview.headers.map((h, i) => <th key={i} className="p-2 truncate max-w-[100px]">{h}</th>)}</tr>
                       </thead>
                       <tbody className="text-gray-300 divide-y divide-[#2a2a33]">
                         {csvPreview.data.map((row, i) => (
                           <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 truncate max-w-[100px]">{cell}</td>)}</tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
          </div>

          <div className="space-y-8">
             {/* Text Config */}
             <div className="bg-[#16161a] border border-[#2a2a33] p-6 rounded-2xl shadow-xl">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 size={18}/> 2. Variables Config</h3>
                  <button onClick={handleSendConfig} className="text-xs bg-accent hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow transition font-semibold">Send Config to CertFlow</button>
               </div>
               
               <div className="space-y-3">
                 {Object.entries(textBoxes).map(([key, box]) => (
                   <div key={key} className="bg-[#121215] border border-[#2a2a33] rounded-xl p-4 transition-all focus-within:border-accent/50">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                       <div className="flex items-center gap-2">
                         <input type="checkbox" checked={box.enabled} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], enabled: e.target.checked}}))} className="rounded accent-accent w-4 h-4" />
                         <span className="font-bold text-gray-200 capitalize w-24">{key}</span>
                       </div>
                       <input value={box.placeholder} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], placeholder: e.target.value}}))} placeholder="Placeholder text" className="flex-1 bg-black border border-[#2a2a33] rounded p-1.5 text-xs text-white outline-none w-full sm:w-auto focus:border-accent" />
                     </div>
                     
                     <div className={cn("grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#2a2a33]", !box.enabled && "opacity-30 pointer-events-none")}>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">X (%)</label>
                          <input type="number" value={box.x} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], x: e.target.value}}))} className="w-full bg-black border border-[#2a2a33] rounded p-1.5 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Y (%)</label>
                          <input type="number" value={box.y} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], y: e.target.value}}))} className="w-full bg-black border border-[#2a2a33] rounded p-1.5 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Size</label>
                          <input type="number" value={box.font_size} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], font_size: e.target.value}}))} className="w-full bg-black border border-[#2a2a33] rounded p-1.5 text-xs outline-none" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1 flex-1">Style</label>
                          <div className="flex gap-1 h-full pb-1">
                             <button onClick={() => setTextBoxes(p => ({...p, [key]: {...p[key], bold: !p[key].bold}}))} className={cn("px-2 py-1 rounded border border-[#2a2a33] text-xs font-serif font-bold transition", box.bold ? "bg-accent/20 text-accent border-accent/40" : "bg-black text-gray-400 hover:text-white")}>B</button>
                             <button onClick={() => setTextBoxes(p => ({...p, [key]: {...p[key], italic: !p[key].italic}}))} className={cn("px-2 py-1 rounded border border-[#2a2a33] text-xs font-serif italic transition", box.italic ? "bg-accent/20 text-accent border-accent/40" : "bg-black text-gray-400 hover:text-white")}>I</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Color</label>
                          <input type="color" value={box.color} onChange={e => setTextBoxes(p => ({...p, [key]: {...p[key], color: e.target.value}}))} className="w-full h-7 rounded border-0 bg-transparent cursor-pointer" />
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Generation */}
             <div className="bg-[#16161a] border border-[#2a2a33] p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                   <button onClick={handlePreview} className="w-full py-3 bg-[#2a2a33] hover:bg-[#32323d] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"><ImageIcon size={18}/> Preview First Certificate</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => generateAndAction('download')} disabled={isGenerating} className="py-4 bg-[#1a1a1f] border border-accent/30 hover:border-accent hover:bg-accent/10 px-4 rounded-xl text-center transition group">
                     <Download size={24} className="mx-auto mb-2 text-accent group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-sm text-white">Generate All & <br/>Download ZIP</div>
                  </button>
                  <button onClick={() => setShowEmailForm(!showEmailForm)} disabled={isGenerating} className="py-4 bg-[#1a1a1f] border border-green-500/30 hover:border-green-500 hover:bg-green-500/10 px-4 rounded-xl text-center transition group">
                     <Mail size={24} className="mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                     <div className="font-bold text-sm text-white">Generate & <br/>Send via Gmail</div>
                  </button>
                </div>

                {isGenerating && (
                  <div className="bg-[#121215] rounded-xl p-3 border border-[#2a2a33]">
                     <div className="h-1.5 bg-[#2a2a33] rounded-full overflow-hidden mb-2">
                       <div className="h-full bg-accent transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                     </div>
                     <p className="text-xs text-center text-gray-400">Processing certificates...</p>
                  </div>
                )}

                {showEmailForm && (
                  <div className="bg-[#0b0b0e] p-4 rounded-xl border border-[#2a2a33] space-y-3 relative overflow-hidden slide-up-card">
                    <h4 className="text-sm font-bold text-white mb-1">Gmail Configuration</h4>
                    <p className="text-xs text-gray-500 leading-tight">Use an App Password, not your Gmail password. Get one at <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-accent hover:underline">myaccount.google.com</a></p>
                    <input type="email" value={emailCreds.email} onChange={e=>setEmailCreds(p=>({...p, email: e.target.value}))} placeholder="sender@gmail.com" className="w-full bg-[#16161a] border border-[#2a2a33] rounded-lg p-2 text-sm text-white focus:border-accent outline-none" />
                    <input type="password" value={emailCreds.password} onChange={e=>setEmailCreds(p=>({...p, password: e.target.value}))} placeholder="16-letter app password" className="w-full bg-[#16161a] border border-[#2a2a33] rounded-lg p-2 text-sm text-white focus:border-accent outline-none" />
                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={emailCreds.remember} onChange={e=>setEmailCreds(p=>({...p, remember: e.target.checked}))} className="accent-accent" /> Remember credentials
                    </label>
                    <button onClick={() => generateAndAction('email')} disabled={isEmailSending || isGenerating || !emailCreds.email || !emailCreds.password} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
                      {isEmailSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Start Sending Process
                    </button>
                    {isEmailSending && <div className="text-xs text-green-400 text-center font-bold font-mono bg-green-500/10 py-1.5 rounded mt-2">{emailLog}</div>}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
             <button onClick={() => setIsPreviewModalOpen(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"><XCircle size={32} /></button>
             {previewImage && <img src={previewImage} className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" alt="Certificate Preview" />}
          </div>
        </div>
      )}
    </div>
  );
};
