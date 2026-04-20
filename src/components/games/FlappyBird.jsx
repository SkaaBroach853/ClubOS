import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

export const FlappyBird = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('clubos_hs_flappy');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let frames = 0;
    let score = 0;
    let state = 0; // 0: get ready, 1: play, 2: game over
    let req;

    const bird = {
      x: 50, y: 150, w: 36, h: 36, radius: 18,
      velocity: 0, gravity: 0.45, jump: -8, maxFall: 12,
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.min((this.velocity * 0.1), Math.PI/4));
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(25, 0); ctx.lineTo(10, 5); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(6, -6, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(8, -6, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      },
      update() {
        if (state !== 1) return;
        this.velocity += this.gravity;
        if(this.velocity > this.maxFall) this.velocity = this.maxFall;
        this.y += this.velocity;
        if(this.y + this.radius >= 520) { this.y = 520 - this.radius; state = 2; }
        if(this.y - this.radius <= 0) { this.y = this.radius; this.velocity = 0; }
      },
      flap() {
        if(state !== 2) this.velocity = this.jump;
      }
    };

    const pipes = {
      position: [],
      w: 50, gap: 180, dx: 3,
      draw() {
        for(let i=0; i<this.position.length; i++){
          let p = this.position[i];
          let topY = p.y;
          let bottomY = p.y + this.gap;
          
          ctx.fillStyle = '#22c55e';
          // top pipe
          ctx.fillRect(p.x, 0, this.w, topY);
          ctx.fillStyle = '#16a34a'; ctx.fillRect(p.x-5, topY-20, this.w+10, 20);
          
          // bottom pipe
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(p.x, bottomY, this.w, 520 - bottomY);
          ctx.fillStyle = '#16a34a'; ctx.fillRect(p.x-5, bottomY, this.w+10, 20);
        }
      },
      update() {
        if(state !== 1) return;
        if(frames % 90 === 0) {
          const maxY = 520 - 50 - this.gap;
          const minY = 50;
          this.position.push({ x: 420, y: Math.floor(Math.random()*(maxY-minY+1)+minY), passed: false });
        }
        for(let i=0; i<this.position.length; i++) {
          let p = this.position[i];
          p.x -= this.dx;
          let bottomY = p.y + this.gap;
          
          // Collision
          const cx = bird.x; const cy = bird.y; const r = bird.radius - 4; // forgive margin
          
          if(cx + r > p.x && cx - r < p.x + this.w && cy - r < p.y) state = 2; // top pipe
          if(cx + r > p.x && cx - r < p.x + this.w && cy + r > bottomY) state = 2; // bottom pipe
          
          // Score
          if(p.x + this.w < bird.x && !p.passed) {
             score++; p.passed = true;
          }
          
          if(p.x + this.w <= 0){
             this.position.shift(); i--;
          }
        }
      },
      reset() { this.position = []; }
    };

    let cx = 0;
    const bg = {
      draw() {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0,0,420,520);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const cld = [
          {x: cx%420, y: 100}, {x: (cx+200)%420, y: 80}, {x: (cx+350)%420, y: 150},
          {x: (cx+420)%420, y: 100}, {x: (cx+620)%420, y: 80}, {x: (cx+770)%420, y: 150}
        ];
        cld.forEach(c => {
           ctx.beginPath(); ctx.arc(c.x, c.y, 40, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.arc(c.x+30, c.y+10, 30, 0, Math.PI*2); ctx.fill();
        });
        if(state===1) cx-=0.5;
      }
    };

    const draw = () => {
      bg.draw();
      pipes.draw();
      pipes.update();
      bird.draw();
      bird.update();
      
      ctx.fillStyle = '#fff';
      if(state === 0) {
        ctx.font = 'bold 24px Arial'; ctx.textAlign='center';
        ctx.fillText('Click or Space to Start', 210, 260);
      } else if (state === 1) {
        ctx.font = 'bold 40px Impact'; ctx.textAlign='center';
        ctx.fillText(score, 210, 80);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeText(score, 210, 80);
      } else if (state === 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,420,520);
        ctx.fillStyle = '#fff'; ctx.textAlign='center';
        ctx.font = 'bold 40px Impact'; ctx.fillText('GAME OVER', 210, 200);
        ctx.font = 'bold 24px Arial'; ctx.fillText(`Score: ${score}`, 210, 250);
        const hs = Math.max(score, highScore);
        setHighScore(hs);
        localStorage.setItem('clubos_hs_flappy', hs);
        ctx.fillText(`Best: ${hs}`, 210, 290);
        
        ctx.fillStyle = '#2a2a33'; ctx.fillRect(135, 330, 150, 45);
        ctx.fillStyle = '#fff'; ctx.font='bold 18px Arial'; ctx.fillText('Restart', 210, 358);
      }
      
      frames++;
      req = requestAnimationFrame(draw);
    };
    
    draw();

    const handleInput = (e) => {
      if(e.type === 'keydown' && e.code !== 'Space') return;
      if(e.type === 'keydown') e.preventDefault();
      
      if(state === 0) { state = 1; bird.flap(); }
      else if(state === 1) bird.flap();
      else if(state === 2) {
         // handle restart click box roughly or just any space
         bird.y = 150; bird.velocity = 0; pipes.reset(); score = 0; state = 0;
      }
    };

    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, {passive:false});

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('keydown', handleInput);
      canvas.removeEventListener('mousedown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
    };
  }, [highScore]);

  return (
    <div className="flex flex-col items-center slide-up-card w-full">
       <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition"><ArrowLeft size={16}/> Back to Games</button>
       <canvas ref={canvasRef} width={420} height={520} className="bg-black border border-[#2a2a33] shadow-xl rounded-lg touch-none" style={{touchAction:'none'}} />
    </div>
  );
};
