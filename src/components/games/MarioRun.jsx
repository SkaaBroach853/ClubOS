import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

export const MarioRun = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('clubos_hs_mario');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let frames = 0; let score = 0; let state = 0; let req;
    let groundY = 420; let speed = 5;

    const mario = {
      x: 50, y: groundY - 26, w: 26, h: 26,
      vy: 0, gravity: 0.6, jumpPower: -13, isGrounded: true,
      draw(c) {
         c.save(); c.translate(this.x, this.y);
         if(state===2) c.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(3)'; // red dead
         // Cap
         c.fillStyle = '#ef4444'; c.fillRect(4, 0, 18, 6); c.fillRect(16, 2, 8, 4);
         // Face
         c.fillStyle = '#fed7aa'; c.fillRect(6, 6, 14, 8);
         // Body
         c.fillStyle = '#3b82f6'; c.fillRect(6, 14, 14, 8); c.fillStyle = '#ef4444'; c.fillRect(6, 14, 4, 8); c.fillRect(16, 14, 4, 8);
         // Shoes
         c.fillStyle = '#78350f'; c.fillRect(2, 22, 6, 4); c.fillRect(18, 22, 6, 4);
         c.restore();
      },
      update() {
         if(state !== 1) return;
         this.vy += this.gravity;
         this.y += this.vy;
         if(this.y + this.h >= groundY) { this.y = groundY - this.h; this.vy = 0; this.isGrounded = true; }
      },
      jump() { if(this.isGrounded && state === 1) { this.vy = this.jumpPower; this.isGrounded = false; } }
    };

    let obstacles = []; let coins = []; let clouds = [{x: 100, y: 100, s: 1}, {x: 300, y: 60, s: 2}, {x: 500, y: 120, s: 1.5}];

    const playCoin = () => {
      try {
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = actx.createOscillator(); const gain = actx.createGain();
        osc.connect(gain); gain.connect(actx.destination);
        osc.frequency.setValueAtTime(660, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, actx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
        osc.start(); osc.stop(actx.currentTime + 0.1);
      } catch(e){}
    };

    let bgOffset = 0;
    const draw = () => {
      // Sky
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(0,0,420,520);
      
      // Clouds
      ctx.fillStyle = '#fff';
      clouds.forEach(c => {
         ctx.beginPath(); ctx.arc(c.x, c.y, 20*c.s, 0, Math.PI*2); ctx.fill();
         ctx.beginPath(); ctx.arc(c.x+15*c.s, c.y-10*c.s, 15*c.s, 0, Math.PI*2); ctx.fill();
         if(state===1) c.x -= c.s * 0.5;
         if(c.x < -100) c.x = 450;
      });

      // Ground
      if(state===1) bgOffset = (bgOffset + speed) % 40;
      ctx.fillStyle = '#84cc16'; ctx.fillRect(0, groundY, 420, 20); // Top grass
      ctx.fillStyle = '#854d0e'; ctx.fillRect(0, groundY+20, 420, 100); // Dirt
      ctx.fillStyle = '#713f12'; 
      for(let i=0; i<420; i+=40) { ctx.fillRect(i - bgOffset, groundY+30, 20, 10); ctx.fillRect(i+20 - bgOffset, groundY+50, 20, 10); }

      if(state === 0) {
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,420,520);
        ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 24px Arial'; ctx.fillText('Click or Space to Run', 210, 260);
      } else if(state === 2) {
        // Shake logic in component level? No, do it here
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,420,520);
        ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 40px Impact'; ctx.fillText('GAME OVER', 210, 200);
        ctx.font='bold 20px Arial'; ctx.fillText(`Score: ${Math.floor(score)}`, 210, 250);
        const hs = Math.max(Math.floor(score), highScore); setHighScore(hs); localStorage.setItem('clubos_hs_mario', hs);
        ctx.fillText(`Best: ${hs}`, 210, 290);
        ctx.fillText('Tap to Restart', 210, 360);
      }

      if(state === 1 || state === 2) {
         mario.draw(ctx); mario.update();
         
         // Obstacles
         if(state===1 && frames % Math.floor(Math.random()*60+80) === 0) {
            const isBlock = Math.random() > 0.5;
            if(isBlock) obstacles.push({x: 420, y: groundY-60, w: 40, h: 20, type:'block'});
            else obstacles.push({x: 420, y: groundY - (Math.random()*60+60), w: 30, h: 120, type:'pipe'}); // y is top of pipe
         }

         obstacles.forEach((ob, i) => {
            if(state===1) ob.x -= speed;
            if(ob.type === 'pipe') {
               ctx.fillStyle = '#22c55e'; ctx.fillRect(ob.x+2, ob.y+10, ob.w-4, 520);
               ctx.fillStyle = '#16a34a'; ctx.fillRect(ob.x, ob.y, ob.w, 10);
            } else {
               ctx.fillStyle = '#ca8a04'; ctx.fillRect(ob.x, ob.y, ob.w, ob.h); ctx.fillStyle = '#854d0e'; ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
            }
            
            // Col
            const colY = ob.type === 'pipe' ? 520 : ob.h; // block has height constraint
            if (mario.x < ob.x + ob.w && mario.x + mario.w - 4 > ob.x && mario.y < ob.y + colY && mario.y + mario.h > ob.y) {
               state = 2; // Dead
            }
            if(ob.x + ob.w < 0) obstacles.splice(i,1);
         });

         // Coins
         if(state===1 && Math.random() < 0.02) coins.push({x: 420, y: groundY - 40 - Math.random()*80, r: 8});
         coins.forEach((c, i) => {
            if(state===1) c.x -= speed;
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ca8a04'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText('$', c.x, c.y+3);
            
            // dist collision
            const dx = (mario.x+mario.w/2) - c.x; const dy = (mario.y+mario.h/2) - c.y;
            if(Math.sqrt(dx*dx+dy*dy) < 20) {
               score += 10; coins.splice(i,1); playCoin();
            } else if (c.x < 0) coins.splice(i,1);
         });

         if(state===1) { score += 0.1; speed = 5 + Math.floor(score/100); }
         
         ctx.fillStyle='#fff'; ctx.textAlign='right'; ctx.font='bold 20px Arial'; ctx.fillText(Math.floor(score), 400, 30);
      }
      
      frames++;
      req = requestAnimationFrame(draw);
    };

    draw();

    const onAction = () => {
       if(state === 0) state = 1;
       else if(state === 1) mario.jump();
       else if(state === 2) { state=0; score=0; speed=5; obstacles=[]; coins=[]; frames=0; mario.y=groundY-mario.h; }
    };
    
    const onKb = (e) => { if(e.code==='Space') { e.preventDefault(); onAction(); } };
    window.addEventListener('keydown', onKb);
    canvas.addEventListener('mousedown', onAction);
    canvas.addEventListener('touchstart', onAction, {passive:false});

    return () => { cancelAnimationFrame(req); window.removeEventListener('keydown', onKb); canvas.removeEventListener('mousedown', onAction); canvas.removeEventListener('touchstart', onAction); };
  }, [highScore]);

  return (
    <div className="flex flex-col items-center slide-up-card w-full">
       <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition"><ArrowLeft size={16}/> Back to Games</button>
       <canvas ref={canvasRef} width={420} height={520} className="bg-black border border-[#2a2a33] shadow-xl rounded-lg touch-none" style={{touchAction:'none'}} />
    </div>
  );
};
