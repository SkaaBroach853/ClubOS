import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { UploadCloud, Download, CheckCircle, Zap, ShieldCheck } from 'lucide-react';


export const QRCheckIn = ({ onShowToast }) => {
  const [eventName, setEventName] = useState('');
  const [attendeesRaw, setAttendeesRaw] = useState('');
  const [passList, setPassList] = useState([]); // { name, email, id, qr, checkedIn, time }
  const [scanId, setScanId] = useState('');

  useEffect(() => {
    if (eventName) {
      const saved = localStorage.getItem('clubos_checkin_' + eventName);
      if (saved) setPassList(JSON.parse(saved));
    }
  }, [eventName]);

  const saveState = (list) => {
    if(!eventName) return;
    localStorage.setItem('clubos_checkin_' + eventName, JSON.stringify(list));
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setAttendeesRaw(evt.target.result);
    reader.readAsText(file);
  };

  const generateQRs = async () => {
    if(!eventName.trim() || !attendeesRaw.trim()) {
      onShowToast("Enter Event Name and Attendees", "error");
      return;
    }
    
    // Simple CSV / Line parser
    const lines = attendeesRaw.split('\n').filter(l => l.trim().length > 0);
    const newList = [];
    
    // Check if CSV with header
    let startIndex = 0;
    if(lines[0].toLowerCase().includes('name')) startIndex = 1;

    for (let i = startIndex; i < lines.length; i++) {
       const line = lines[i];
       const parts = line.split(',');
       const name = parts[0]?.trim();
       const email = parts[1]?.trim() || '';
       if (!name) continue;
       
       const id = Math.random().toString(36).substr(2, 8).toUpperCase();
       
       try {
         const qrString = JSON.stringify({ name, event: eventName, id });
         const qrData = await QRCode.toDataURL(qrString, { margin: 2, scale: 6 });
         newList.push({ name, email, id, qr: qrData, checkedIn: false, time: null });
       } catch(e) { }
    }
    setPassList(newList);
    saveState(newList);
    onShowToast(`Generated ${newList.length} passes!`);
  };

  const downloadZip = async () => {
    if(passList.length === 0) return;
    const zip = new JSZip();
    passList.forEach(p => {
       const b64Data = p.qr.replace(/^data:image\/(png|jpg);base64,/, "");
       zip.file(`${p.name.replace(/\\s+/g, '_')}_${p.id}.png`, b64Data, {base64: true});
    });
    const blob = await zip.generateAsync({type:"blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ClubOS_QRs_${eventName}.zip`;
    a.click();
  };

  const handleScan = (e) => {
    e.preventDefault();
    if(!scanId.trim()) return;
    const target = scanId.trim().toUpperCase();
    let found = false;
    
    const updated = passList.map(p => {
       if (p.id === target) {
         found = true;
         if(!p.checkedIn) {
           onShowToast(`✅ ${p.name} Checked In!`);
           return { ...p, checkedIn: true, time: new Date().toLocaleTimeString() };
         } else {
           onShowToast(`⚠️ ${p.name} already checked in at ${p.time}`, "error");
         }
       }
       return p;
    });
    
    if(!found) onShowToast("❌ Invalid ID", "error");
    
    setPassList(updated);
    saveState(updated);
    setScanId('');
  };

  const downloadCsv = () => {
    const header = "Name,Email,ID,CheckedIn,CheckInTime\n";
    const rows = passList.map(p => `${p.name},${p.email},${p.id},${p.checkedIn?"Yes":"No"},${p.time||""}`).join('\n');
    const blob = new Blob([header+rows], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Attendance_${eventName}.csv`; a.click();
  };

  const checkedInCount = passList.filter(p => p.checkedIn).length;
  const perc = passList.length ? (checkedInCount / passList.length) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 slide-up-card h-full min-h-[600px]">
      
      {/* Left side -> Generation */}
      <div className="flex-1 bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] -z-10 group-hover:bg-accent/10 transition-colors"></div>
         <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Zap className="text-accent" /> Configure Passes</h2>
         
         <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Event Name</label>
              <input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. CodeFest 2026" className="w-full bg-[#121215] border border-[#2a2a33] rounded-xl p-3 text-white outline-none focus:border-accent transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Attendees List (Name, Email)</label>
              <textarea value={attendeesRaw} onChange={e=>setAttendeesRaw(e.target.value)} placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com" className="w-full h-32 bg-[#121215] border border-[#2a2a33] rounded-xl p-3 text-white outline-none focus:border-accent transition-colors resize-none custom-scrollbar text-sm" />
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Or upload CSV with these columns</span>
                <label className="text-xs font-bold text-accent cursor-pointer flex items-center gap-1 hover:underline">
                  <UploadCloud size={14}/> Upload CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                </label>
              </div>
            </div>

            <button onClick={generateQRs} className="w-full py-3 bg-accent hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
               Generate QR Codes Mode
            </button>
         </div>

         {passList.length > 0 && (
           <div className="mt-8 pt-6 border-t border-[#2a2a33] flex-1 flex flex-col h-1">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-200">Generated ({passList.length})</h3>
                <button onClick={downloadZip} className="text-xs font-bold text-white bg-[#2a2a33] hover:bg-[#32323d] px-3 py-1.5 rounded-lg flex items-center gap-1"><Download size={14} /> ZIP</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3 pr-2">
                {passList.map(p => (
                   <div key={p.id} className="bg-[#121215] border border-[#2a2a33] p-3 rounded-xl flex flex-col items-center">
                     <img src={p.qr} alt="QR Component" className="w-20 h-20 bg-white p-1 rounded-lg mb-2" />
                     <span className="text-xs font-bold text-white truncate w-full text-center">{p.name}</span>
                     <span className="text-[10px] text-gray-500 font-mono tracking-wider">{p.id}</span>
                   </div>
                ))}
             </div>
           </div>
         )}
      </div>

      {/* Right side -> Scanner Panel */}
      <div className="w-full lg:w-[350px] bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[50px] -z-10 group-hover:bg-green-500/10 transition-colors"></div>
         <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><ShieldCheck className="text-green-500" /> Live Check-In</h2>

         <div className="bg-[#121215] border border-[#2a2a33] rounded-xl p-5 text-center mb-6 shadow-inner">
           <div className="text-4xl font-black text-white mb-1 tabular-nums tracking-tighter">{checkedInCount} <span className="text-xl text-gray-500">/ {passList.length||0}</span></div>
           <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Checked In</div>
           
           <div className="w-full bg-[#2a2a33] h-2 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 transition-all duration-700 ease-out" style={{ width: `${perc}%` }}></div>
           </div>
         </div>

         <form onSubmit={handleScan} className="mb-6 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Scan / Type ID</label>
            <input autoFocus value={scanId} onChange={e=>setScanId(e.target.value)} placeholder="Scan QR or type 8-char ID..." className="w-full bg-black border-2 border-green-500/30 focus:border-green-500 rounded-xl p-3 text-white text-center font-mono tracking-widest font-bold placeholder:text-gray-600 outline-none transition-colors" />
            <button type="submit" className="hidden">Submit</button>
         </form>

         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4">
            {passList.filter(p => p.checkedIn).reverse().map(p => (
               <div key={p.id} className="bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg flex items-center justify-between slide-up-card">
                 <div className="flex items-center gap-2 overflow-hidden w-full">
                    <CheckCircle className="text-green-400 shrink-0" size={16} />
                    <span className="text-sm font-bold text-green-100 truncate">{p.name}</span>
                 </div>
                 <span className="text-[10px] text-green-400 shrink-0 font-mono">{p.time}</span>
               </div>
            ))}
         </div>

         <button onClick={downloadCsv} disabled={passList.length===0} className="w-full py-3 bg-[#2a2a33] hover:bg-[#32323d] text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50">
           <Download size={16} /> Export Attendance
         </button>
      </div>

    </div>
  );
};
