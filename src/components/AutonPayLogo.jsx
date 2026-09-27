import React from 'react';

export default function AutonPayLogo({ size = 32, withText = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon SVG */}
      <div 
        style={{ width: size, height: size }} 
        className="rounded-xl bg-[#0b1326] border border-cyan-500/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-950/50 flex-shrink-0"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>

          {/* Outer Node Connections */}
          <circle cx="32" cy="12" r="3" fill="#38bdf8" />
          <circle cx="14" cy="48" r="3" fill="#818cf8" />
          <circle cx="50" cy="48" r="3" fill="#34d399" />

          {/* Geometric Letter A Shape */}
          <path d="M32 12 L14 48 L25 48 L32 34 L39 48 L50 48 Z" fill="url(#logoGrad)" />
          
          {/* Core Rail & Pulse Node */}
          <path d="M23 38 L41 38" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="38" r="2.5" fill="#00f2fe" />
        </svg>
      </div>

      {/* Typography Brand */}
      {withText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-white text-base tracking-wider">
              AUTON<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PAY</span>
            </span>
            <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold leading-none">
              PAYFI M2M
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
            Autonomous Payment Rail
          </p>
        </div>
      )}
    </div>
  );
}