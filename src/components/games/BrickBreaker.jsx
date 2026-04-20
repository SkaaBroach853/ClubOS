import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

export const BrickBreaker = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('clubos_hs_breaker');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let req;
    let state = 0; // 0: start, 1: play, 2: over, 3: win level
    let score = 0;
    let lives = 3;
    let level = 1;
    
    // Paddle
    const paddle = { w: 80, h: 10, x: 420/2 - 40, y: 520 - 20, speed: 8, dx: 0 };
    
    // Balls array
    let balls = [{ x: 420/2, y: 520 - 30, r: 8, dx: 3, dy: -4 }];
    
    // Bricks
    const brickConfig = { r: 6, c: 10, w: 36, h: 14, pad: 4, offsetTop: 50, offsetLeft: 10 };
    let bricks = [];
    const colors = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#8b5cf6'];
    
    const initBricks = () => {
       bricks = [];
       for(let i=0; i<brickConfig.r + (level-1); i++) {
         for(let j=0; j<brickConfig.c; j++) {
           bricks.push({ x: j*(brickConfig.w+brickConfig.pad)+brickConfig.offsetLeft, 
                         y: i*(brickConfig.h+brickConfig.pad)+brickConfig.offsetTop, 
                         status: 1, color: colors[i % colors.length] });
         }
       }
    };
    initBricks();

    // Powerups
    let powers = [];
    let activePowers = [];

    const draw = () => {
      ctx.fillStyle = '#16161a';
      ctx.fillRect(0,0,420,520);
      
      if(state === 0) {
        ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 24px Arial';
        ctx.fillText('Click or Space to Start', 210, 260);
      } else if (state === 2 || state === 3) {
         ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,420,520);
         ctx.fillStyle = '#fff'; ctx.textAlign='center';
         ctx.font = 'bold 40px Impact'; ctx.fillText(state===2?'GAME OVER':'LEVEL CLEAR!', 210, 200);
         ctx.font = 'bold 24px Arial'; ctx.fillText(`Score: ${score}`, 210, 250);
         if(state===2){
           const hs = Math.max(score, highScore);
           setHighScore(hs); localStorage.setItem('clubos_hs_breaker', hs);
           ctx.fillText(`Best: ${hs}`, 210, 290);
           ctx.fillText('Click to Restart', 210, 350);
         } else {
           ctx.fillText('Click for Next Level', 210, 350);
         }
      }

      if(state === 1 || state === 3) {
         // Draw Paddle
         ctx.fillStyle = '#9ca3af';
         ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

         // Draw Balls
         ctx.fillStyle = '#fff';
         balls.forEach(b => {
           ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
         });

         // Draw Bricks
         let activeBricks = 0;
         bricks.forEach(br => {
           if(br.status === 1) {
             activeBricks++;
             ctx.fillStyle = br.color; ctx.fillRect(br.x, br.y, brickConfig.w, brickConfig.h);
           }
         });
         
         if(activeBricks === 0 && state === 1) state = 3;

         // Draw powers
         powers.forEach((p, idx) => {
            p.y += 2;
            ctx.fillStyle = p.type==='W'?'#3b82f6':p.type==='M'?'#22c55e':'#facc15';
            ctx.fillRect(p.x, p.y, 16, 16);
            ctx.fillStyle = '#000'; ctx.font='10px Arial'; ctx.fillText(p.type, p.x+8, p.y+11);
            if(p.y > 520) powers.splice(idx,1);
            // Catch
            if(p.y+16 > paddle.y && p.y < paddle.y+paddle.h && p.x+16 > paddle.x && p.x < paddle.x+paddle.w) {
               powers.splice(idx,1);
               if(p.type==='W') { paddle.w = 130; setTimeout(()=>paddle.w=80, 10000); }
               if(p.type==='M') { 
                  let b = balls[0];
                  if(b) { balls.push({x:b.x, y:b.y, r:b.r, dx:-b.dx, dy:b.dy}, {x:b.x, y:b.y, r:b.r, dx:b.dx, dy:-b.dy}); }
               }
               if(p.type==='S') { 
                  balls.forEach(b => { b.dx*=0.7; b.dy*=0.7; });
                  setTimeout(() => balls.forEach(b => { b.dx/=0.7; b.dy/=0.7; }), 10000);
               }
            }
         });

         // Update Balls
         if(state === 1) {
             for(let i=0; i<balls.length; i++){
                let b = balls[i];
                b.x += b.dx; b.y += b.dy;
                if(b.x+b.r > 420 || b.x-b.r < 0) b.dx = -b.dx;
                if(b.y-b.r < 0) b.dy = -b.dy;
                
                // Paddle
                if(b.y+b.r > paddle.y && b.x > paddle.x && b.x < paddle.x+paddle.w) {
                   b.dy = -Math.abs(b.dy);
                   let hitPoint = b.x - (paddle.x + paddle.w/2);
                   b.dx = hitPoint * 0.15; // sharper angle from edges
                }
                
                // Bricks collision
                let hitBricks = false;
                bricks.forEach(br => {
                  if(br.status === 1) {
                    if(b.x > br.x && b.x < br.x+brickConfig.w && b.y > br.y && b.y < br.y+brickConfig.h) {
                       b.dy = -b.dy; br.status = 0; score += 10; hitBricks = true;
                       if(Math.random()<0.2) powers.push({x: br.x+10, y: br.y, type: ['W','M','S'][Math.floor(Math.random()*3)]});
                    }
                  }
                });
                
                if(b.y+b.r > 520) { balls.splice(i,1); i--; }
             }
             
             if(balls.length === 0) {
               lives--;
               if(lives > 0) {
                 balls = [{ x: paddle.x+paddle.w/2, y: paddle.y-10, r: 8, dx: 3*(Math.random()>0.5?1:-1), dy: -4 }];
               } else {
                 state = 2; // over
               }
             }

             // Auto move paddle towards desktop mouse dx
             paddle.x += paddle.dx;
             if(paddle.x < 0) paddle.x = 0;
             if(paddle.x + paddle.w > 420) paddle.x = 420 - paddle.w;
         }

         // UI overlay
         ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.font='bold 14px Arial';
         ctx.fillText(`Score: ${score}`, 10, 20);
         ctx.textAlign='right'; ctx.fillText(`Level: ${level}`, 410, 20);
         
         ctx.textAlign='center'; 
         let hearts = '❤️'.repeat(lives);
         ctx.fillText(hearts, 210, 20);
      }
      
      req = requestAnimationFrame(draw);
    };

    draw();

    const movePaddle = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const root = document.documentElement;
      const mouseX = clientX - rect.left - root.scrollLeft;
      paddle.x = mouseX - paddle.w/2;
    };

    const onMouse = (e) => { movePaddle(e.clientX); };
    const onTouchMove = (e) => { movePaddle(e.touches[0].clientX); };
    
    const onAction = () => {
       if(state===0) { state=1; }
       if(state===2) { lives=3; score=0; level=1; initBricks(); state=1; balls=[{x:420/2,y:500,r:8,dx:3,dy:-4}]; powers=[]; }
       if(state===3) { level++; initBricks(); state=1; balls=[{x:420/2,y:500,r:8,dx:3+level*0.15,dy:-(4+level*0.15)}]; powers=[]; }
    };
    
    const onKb = (e) => {
      if(e.code==='Space') onAction();
      if(e.code==='ArrowLeft') paddle.dx = -8;
      if(e.code==='ArrowRight') paddle.dx = 8;
    };
    const onKbUp = (e) => {
      if(e.code==='ArrowLeft' || e.code==='ArrowRight') paddle.dx = 0;
    };

    window.addEventListener('keydown', onKb);
    window.addEventListener('keyup', onKbUp);
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouchMove, {passive:false});
    canvas.addEventListener('mousedown', onAction);
    canvas.addEventListener('touchstart', onAction, {passive:false});

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('keydown', onKb);
      window.removeEventListener('keyup', onKbUp);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mousedown', onAction);
      canvas.removeEventListener('touchstart', onAction);
    };
  }, [highScore]);

  return (
    <div className="flex flex-col items-center slide-up-card w-full">
       <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition"><ArrowLeft size={16}/> Back to Games</button>
       <canvas ref={canvasRef} width={420} height={520} className="bg-black border border-[#2a2a33] shadow-xl rounded-lg touch-none" style={{touchAction:'none'}} />
    </div>
  );
};
