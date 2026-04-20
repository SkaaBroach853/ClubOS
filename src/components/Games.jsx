import React, { useState } from 'react';
import { Gamepad2, Blocks, Ghost, SkipForward } from 'lucide-react';
import { cn } from '../lib/utils';
import { FlappyBird } from './games/FlappyBird';
import { Tetris } from './games/Tetris';
import { BrickBreaker } from './games/BrickBreaker';
import { MarioRun } from './games/MarioRun';

export const Games = ({ onShowToast: _onShowToast }) => {
  const [activeGame, setActiveGame] = useState(null);

  const gamesConfig = [
    { id: 'flappy', title: 'Flappy Bird', tagline: 'Tap to fly, avoid pipes', icon: Ghost, color: 'text-yellow-400', Component: FlappyBird },
    { id: 'tetris', title: 'Tetris', tagline: 'Classic block stacking', icon: Blocks, color: 'text-blue-400', Component: Tetris },
    { id: 'brick', title: 'Brick Breaker', tagline: 'Paddle bounce physics', icon: Gamepad2, color: 'text-pink-400', Component: BrickBreaker },
    { id: 'mario', title: 'Runner', tagline: 'Run, jump, collect coins', icon: SkipForward, color: 'text-green-400', Component: MarioRun }
  ];

  if (activeGame) {
    const GameConfig = gamesConfig.find(g => g.id === activeGame);
    if(!GameConfig) return null;
    return (
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center animate-in fade-in duration-500 pb-16">
         <GameConfig.Component onBack={() => setActiveGame(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-16">
      <div className="text-center space-y-4 mb-12">
         <h2 className="text-4xl font-black text-white tracking-tight">Arcade <span className="text-accent">Break</span></h2>
         <p className="text-gray-400 text-lg max-w-2xl mx-auto">Take a break from organizing and set some high scores natively in ClubOS.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         {gamesConfig.map((game, idx) => (
            <div key={game.id} className="bg-[#16161a] border border-[#2a2a33] rounded-2xl p-6 shadow-xl hover:shadow-[0_0_20px_rgba(79,142,247,0.1)] hover:border-accent/40 transition-all group flex flex-col slide-up-card" style={{animationDelay: `${idx*50}ms`, animationFillMode:'both'}}>
               <div className="flex items-center gap-5 mb-6">
                  <div className={cn("w-14 h-14 shrink-0 rounded-2xl bg-black border border-[#2a2a33] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner", game.color)}>
                     <game.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{game.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{game.tagline}</p>
                  </div>
               </div>
               <button onClick={() => setActiveGame(game.id)} className="w-full py-3 bg-[#2a2a33] group-hover:bg-accent text-white font-bold rounded-xl transition-colors mt-auto">
                  Play Game
               </button>
            </div>
         ))}
      </div>
    </div>
  );
};
