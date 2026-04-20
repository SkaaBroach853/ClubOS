import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Zap, Download, RefreshCw, HelpCircle, Target } from 'lucide-react';
import { generateQuizBuilder } from '../../services/gemini';
import { cn } from '../../lib/utils';
import { CardSkeleton } from '../CardSkeleton';

export const QuizBuilder = ({ userKey, onShowToast }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState('5');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null); // { quiz: { title: "", questions: [] } }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleGenerate = async () => {
    if(!topic) return;
    setIsGenerating(true);
    try {
      const res = await generateQuizBuilder(topic, difficulty, numQuestions, userKey);
      if(res && res.quiz) {
         setQuizData(res.quiz);
         restartQuiz(res.quiz);
      }
      onShowToast("Quiz ready!");
    } catch(e) {
      onShowToast("Failed to generate quiz", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const restartQuiz = (data = quizData) => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setWrongAnswers([]);
    setIsFinished(false);
  };

  const currentQ = quizData?.questions[currentIndex];

  const handleSelect = (opt) => {
    if(selectedOption !== null) return;
    setSelectedOption(opt);
    
    if(opt === currentQ.answer) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, { q: currentQ.q, picked: opt, correct: currentQ.answer }]);
    }
  };

  const nextQuestion = () => {
    if(currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(quizData.title, 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 35;
    
    quizData.questions.forEach((q, i) => {
       if(y > 270) { doc.addPage(); y = 20; }
       doc.setFont("helvetica", "bold");
       const qLines = doc.splitTextToSize(`${i+1}. ${q.q}`, 180);
       doc.text(qLines, 14, y);
       y += (qLines.length * 6);
       
       doc.setFont("helvetica", "normal");
       q.options.forEach(opt => {
         doc.text(`[ ] ${opt}`, 20, y);
         y += 6;
       });
       y += 6;
    });

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Answer Key", 14, 22);
    y = 35;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    quizData.questions.forEach((q, i) => {
       if(y > 280) { doc.addPage(); y = 20; }
       const ans = doc.splitTextToSize(`${i+1}. ${q.answer}`, 180);
       doc.text(ans, 14, y);
       y += (ans.length * 6) + 2;
    });

    doc.save(`Quiz_${quizData.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col h-full gap-6 slide-up-card min-h-[600px] w-full max-w-4xl mx-auto">
      {!quizData && (
        <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 sm:p-10 shadow-xl flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>
           <h2 className="text-3xl font-black text-white flex items-center gap-3"><HelpCircle className="text-accent" size={32}/> AI Quiz Builder</h2>
           <p className="text-gray-400 text-sm">Generate engaging multiple-choice quizzes targeting specific topics instantly.</p>
           
           <div className="space-y-4">
             <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Quiz Topic</label>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. History of Web Dev..." className="w-full bg-[#121215] border border-[#2a2a33] p-4 rounded-xl outline-none focus:border-accent text-white" />
             </div>
             
             <div className="flex gap-4">
               <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Difficulty</label>
                <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-4 rounded-xl outline-none focus:border-accent text-white cursor-pointer appearance-none">
                   {["Easy", "Medium", "Hard"].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
               </div>
               <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Questions</label>
                <select value={numQuestions} onChange={e=>setNumQuestions(e.target.value)} className="w-full bg-[#121215] border border-[#2a2a33] p-4 rounded-xl outline-none focus:border-accent text-white cursor-pointer appearance-none">
                   {["5", "10", "15"].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
               </div>
             </div>
           </div>

           <button onClick={handleGenerate} disabled={isGenerating||!topic} className="w-full py-4 bg-accent hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
             {isGenerating ? <Zap size={20} className="animate-spin" /> : <Zap size={20} />} Generate Quiz
           </button>
        </div>
      )}

      {isGenerating && <div className="mt-8"><CardSkeleton /></div>}

      {quizData && !isGenerating && !isFinished && (
         <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col relative flex-1">
            <h3 className="font-bold text-white text-xl mb-6 flex justify-between items-center">
              <span className="truncate pr-4">{quizData.title}</span>
              <span className="bg-[#2a2a33] px-3 py-1 rounded-full text-sm font-mono text-gray-300 whitespace-nowrap">Q {currentIndex + 1} / {quizData.questions.length}</span>
            </h3>

            <div className="w-full bg-[#2a2a33] h-2 rounded-full overflow-hidden mb-10">
               <div className="h-full bg-accent transition-all duration-500" style={{width: `${((currentIndex+1)/quizData.questions.length)*100}%`}}></div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-2xl font-medium text-white mb-8 leading-tight">{currentQ.q}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {currentQ.options.map((opt, idx) => {
                    let btnClass = "bg-[#121215] border border-[#2a2a33] hover:border-accent/50 text-white";
                    if(selectedOption) {
                       if(opt === currentQ.answer) btnClass = "bg-green-500/20 border-green-500 text-white";
                       else if(opt === selectedOption) btnClass = "bg-red-500/20 border-red-500 text-white";
                       else btnClass = "bg-[#121215] border-[#2a2a33] opacity-50";
                    }
                    return (
                      <button key={idx} disabled={selectedOption !== null} onClick={() => handleSelect(opt)} className={cn("p-5 rounded-xl text-left font-medium transition-all duration-300", btnClass)}>
                        {opt}
                      </button>
                    )
                 })}
              </div>
            </div>

            {selectedOption && (
               <div className="mt-8 flex justify-end animate-in slide-in-from-bottom-4">
                  <button onClick={nextQuestion} className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition shadow-lg text-lg">
                    {currentIndex === quizData.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  </button>
               </div>
            )}
         </div>
      )}

      {isFinished && (
         <div className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center relative flex-1 animate-in zoom-in-95">
            <Target size={64} className="text-accent mb-6" />
            <h2 className="text-4xl font-black text-white mb-2">Quiz Complete!</h2>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500 my-6">
               {score} <span className="text-2xl text-gray-500">/ {quizData.questions.length}</span>
            </div>
            
            <p className="text-xl font-medium text-gray-300 mb-10">
              {score/quizData.questions.length >= 0.8 ? "Excellent Performance! 🏆" : score/quizData.questions.length >= 0.5 ? "Good Effort! 👍" : "Needs some work! 📚"}
            </p>

            <div className="w-full max-w-2xl bg-[#121215] border border-[#2a2a33] rounded-2xl p-6 text-left mb-8">
               <h3 className="font-bold text-white mb-4">Wrong Answers Recap:</h3>
               {wrongAnswers.length === 0 ? <p className="text-green-400">Perfect score! Nothing missed.</p> : (
                 <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {wrongAnswers.map((w, i) => (
                       <div key={i} className="border-l-2 border-red-500 pl-4 py-1">
                          <p className="text-gray-200 font-medium mb-1">{w.q}</p>
                          <p className="text-sm text-red-400 line-through">You: {w.picked}</p>
                          <p className="text-sm text-green-400 font-bold">Answer: {w.correct}</p>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl">
               <button onClick={()=>restartQuiz()} className="flex-1 py-3 bg-[#2a2a33] hover:bg-[#32323d] text-white font-bold rounded-xl transition flex items-center justify-center gap-2"><RefreshCw size={16}/> Retake</button>
               <button onClick={()=>setQuizData(null)} className="flex-1 py-3 bg-[#2a2a33] hover:bg-[#32323d] text-white font-bold rounded-xl transition flex items-center justify-center gap-2">New Quiz</button>
               <button onClick={exportPDF} className="flex-1 py-3 bg-accent/20 border border-accent/40 text-accent hover:bg-accent hover:text-white font-bold rounded-xl transition flex items-center justify-center gap-2"><Download size={16}/> Print PDF</button>
            </div>
         </div>
      )}
    </div>
  );
};
