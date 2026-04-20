import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

export const Tetris = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('clubos_hs_tetris');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Config
    const COLS = 10; const ROWS = 20; const BLOCK = 24;
    const offsetX = 60; const offsetY = 20;
    
    let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    let score = 0, level = 1, lines = 0;
    let state = 0; // 0 start, 1 play, 2 over
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let req;

    const COLORS = [null, '#0ea5e9', '#eab308', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316'];
    const PIECES = [
      [], // 0
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]], // I (1)
      [[2,2],[2,2]], // O (2)
      [[0,3,0],[3,3,3],[0,0,0]], // T (3)
      [[0,4,4],[4,4,0],[0,0,0]], // S (4)
      [[5,5,0],[0,5,5],[0,0,0]], // Z (5)
      [[6,0,0],[6,6,6],[0,0,0]], // J (6)
      [[0,0,7],[7,7,7],[0,0,0]]  // L (7)
    ];

    let player = {
       pos: {x:3, y:0},
       matrix: null,
       next: null
    };

    const createPiece = () => {
      return PIECES[Math.floor(Math.random()*(PIECES.length-1))+1];
    };

    const resetPlayer = () => {
       if(!player.next) player.next = createPiece();
       player.matrix = player.next;
       player.next = createPiece();
       player.pos.y = 0; player.pos.x = Math.floor((COLS / 2) - (player.matrix[0].length / 2));
       if (collide(board, player)) {
          state = 2; // Game Over
       }
       dropCounter = 0;
    };

    const drawMatrix = (matrix, offset, alpha=1) => {
       matrix.forEach((row, y) => {
         row.forEach((value, x) => {
           if (value !== 0) {
             ctx.fillStyle = COLORS[value];
             ctx.globalAlpha = alpha;
             ctx.fillRect(offsetX + (x + offset.x) * BLOCK, offsetY + (y + offset.y) * BLOCK, BLOCK - 1, BLOCK - 1);
             ctx.globalAlpha = 1;
           }
         });
       });
    };

    const collide = (arena, p) => {
       const m = p.matrix; const o = p.pos;
       for(let y=0; y<m.length; y++) {
         for(let x=0; x<m[y].length; x++) {
           if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
             return true;
           }
         }
       }
       return false;
    };

    const merge = (arena, p) => {
       p.matrix.forEach((row, y) => {
         row.forEach((value, x) => {
           if(value !== 0) arena[y + p.pos.y][x + p.pos.x] = value;
         });
       });
    };

    const arenaSweep = () => {
       let rowCount = 1; let cleared = 0;
       outer: for (let y = ROWS-1; y>=0; y--) {
          for(let x = 0; x < COLS; x++) {
             if(board[y][x] === 0) continue outer;
          }
          const row = board.splice(y, 1)[0].fill(0);
          board.unshift(row);
          y++; cleared++;
       }
       if(cleared > 0) {
         if(cleared===1) score+=100*level;
         if(cleared===2) score+=300*level;
         if(cleared===3) score+=500*level;
         if(cleared===4) score+=800*level;
         lines += cleared;
         level = Math.floor(lines/10) + 1;
         dropInterval = 1000 - (level * 50);
       }
    };

    const getGhostPos = () => {
       let ghost = { matrix: player.matrix, pos: {x: player.pos.x, y: player.pos.y} };
       while(!collide(board, ghost)) ghost.pos.y++;
       ghost.pos.y--;
       return ghost.pos;
    };

    const playerDrop = () => {
      player.pos.y++;
      if (collide(board, player)) {
        player.pos.y--; merge(board, player); resetPlayer(); arenaSweep();
      }
      dropCounter = 0;
    };

    const playerMove = (offset) => {
      player.pos.x += offset;
      if (collide(board, player)) player.pos.x -= offset;
    };

    const rotate = (matrix) => {
      const N = matrix.length;
      const res = Array.from({length: N}, () => Array(N).fill(0));
      for(let i=0; i<N; i++) for(let j=0; j<N; j++) res[j][N - 1 - i] = matrix[i][j];
      return res;
    };

    const playerRotate = () => {
      const pos = player.pos.x; let offset = 1;
      player.matrix = rotate(player.matrix);
      while(collide(board, player)) {
         player.pos.x += offset;
         offset = -(offset + (offset > 0 ? 1 : -1));
         if (offset > player.matrix[0].length) {
            player.matrix = rotate(rotate(rotate(player.matrix))); // undo
            player.pos.x = pos; return;
         }
      }
    };

    const draw = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      ctx.fillStyle = '#16161a';
      ctx.fillRect(0,0,420,520);
      
      if(state === 0) {
         ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 24px Arial';
         ctx.fillText('Click or Space to Start', 210, 260);
      } else if (state === 2) {
         ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,420,520);
         ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.font='bold 40px Impact'; ctx.fillText('GAME OVER', 210, 200);
         ctx.font='bold 20px Arial'; ctx.fillText(`Score: ${score}`, 210, 250);
         const hs = Math.max(score, highScore); setHighScore(hs); localStorage.setItem('clubos_hs_tetris', hs);
         ctx.fillText(`Best: ${hs}`, 210, 290);
         ctx.fillText('Press Space to Restart', 210, 360);
      } else {
         dropCounter += deltaTime;
         if (dropCounter > dropInterval) playerDrop();

         // Draw Board bg
         ctx.fillStyle = '#000';
         ctx.fillRect(offsetX, offsetY, COLS * BLOCK, ROWS * BLOCK);
         ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 1;
         for(let i=0; i<=ROWS; i++) { ctx.beginPath(); ctx.moveTo(offsetX, offsetY+i*BLOCK); ctx.lineTo(offsetX+COLS*BLOCK, offsetY+i*BLOCK); ctx.stroke(); }
         for(let j=0; j<=COLS; j++) { ctx.beginPath(); ctx.moveTo(offsetX+j*BLOCK, offsetY); ctx.lineTo(offsetX+j*BLOCK, offsetY+ROWS*BLOCK); ctx.stroke(); }

         drawMatrix(board, {x:0, y:0});
         drawMatrix(player.matrix, getGhostPos(), 0.2);
         drawMatrix(player.matrix, player.pos);

         // Stats Panel Right
         ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '14px Arial';
         ctx.fillText('NEXT', 320, 40);
         drawMatrix(player.next, {x: 10.8, y: 1}); // offset hack

         ctx.fillText('SCORE', 320, 160); ctx.fillStyle='#4f8ef7'; ctx.font='bold 20px Arial'; ctx.fillText(score, 320, 185);
         ctx.fillStyle='#fff'; ctx.font='14px Arial'; ctx.fillText('LEVEL', 320, 240); ctx.fillStyle='#4f8ef7'; ctx.font='bold 20px Arial'; ctx.fillText(level, 320, 265);
         ctx.fillStyle='#fff'; ctx.font='14px Arial'; ctx.fillText('LINES', 320, 320); ctx.fillStyle='#4f8ef7'; ctx.font='bold 20px Arial'; ctx.fillText(lines, 320, 345);
      }
      
      req = requestAnimationFrame(draw);
    };

    resetPlayer();
    draw();

    const onKb = (e) => {
       if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
       if(state === 0 && e.code === 'Space') state = 1;
       else if(state === 2 && e.code === 'Space') { board = Array.from({length: ROWS}, () => Array(COLS).fill(0)); score=0; level=1; lines=0; resetPlayer(); state=1; }
       else if(state === 1) {
          if(e.code === 'ArrowLeft') playerMove(-1);
          if(e.code === 'ArrowRight') playerMove(1);
          if(e.code === 'ArrowDown') playerDrop();
          if(e.code === 'ArrowUp') playerRotate();
          if(e.code === 'Space') { while(!collide(board, player)) player.pos.y++; player.pos.y--; playerDrop(); }
       }
    };
    
    window.addEventListener('keydown', onKb);
    return () => { cancelAnimationFrame(req); window.removeEventListener('keydown', onKb); };
  }, [highScore]);

  return (
    <div className="flex flex-col items-center slide-up-card w-full">
       <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white flex items-center gap-2 transition"><ArrowLeft size={16}/> Back to Games</button>
       <canvas ref={canvasRef} width={420} height={520} className="bg-black border border-[#2a2a33] shadow-xl rounded-lg touch-none" style={{touchAction:'none'}} />
    </div>
  );
};
