import React, { useState } from 'react';

export default function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Link resmi token $AUTON di Pump.fun
  const PUMP_FUN_URL = "https://pump.fun/coin/2X7saQ967isTkJEP6FKgFuTzTWsH4ZMkCh1MDGDApump";

  const socialLinks = [
    {
      name: 'Pump.fun',
      url: PUMP_FUN_URL,
      icon: (
        <svg className="w-4 h-4 fill-current text-emerald-400" viewBox="0 0 24 24">
          <path d="M4.5 10.5C3.12 11.88 3.12 14.12 4.5 15.5L8.5 19.5C9.88 20.88 12.12 20.88 13.5 19.5L19.5 13.5C20.88 12.12 20.88 9.88 19.5 8.5L15.5 4.5C14.12 3.12 11.88 3.12 10.5 4.5L4.5 10.5ZM12 8L16 12L12.5 15.5L8.5 11.5L12 8Z" />
        </svg>
      )
    },
    {
      name: 'GitHub',
      url: 'https://github.com/provizto/autonpay',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    },
    {
      name: 'X',
      url: 'https://x.com/zoniqfi',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Telegram',
      url: 'https://t.me/zoniqfi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      )
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/zoniqfi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <footer className="w-full border-t border-slate-800/80 bg-[#080d1a]/90 backdrop-blur-sm mt-auto py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          
          {/* Copyright & Disclaimer Trigger */}
          <div className="text-slate-400 text-center md:text-left text-[11px]">
            <span>© 2026 </span>
            <span className="text-cyan-400 font-bold">AutonPay</span>
            <span> PayFi Rail. </span>
            <button
              onClick={() => setShowDisclaimer(true)}
              className="text-slate-500 hover:text-slate-300 underline underline-offset-2 ml-1 cursor-pointer transition"
            >
              Non-Custodial Disclaimer
            </button>
          </div>

          {/* Proposal, Defense, & Pump.fun Direct Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            <a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-emerald-200 transition flex items-center gap-1.5 font-bold bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
            >
              <span>💊</span> $AUTON on Pump.fun ↗
            </a>

            <a
              href="/AutonPay_Grant_Proposal.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition flex items-center gap-1.5 font-bold bg-slate-900 border border-slate-800 hover:border-cyan-500/60 px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
            >
              <span>📄</span> Grant Proposal ↗
            </a>

            <a
              href="/AutonPay_Capital_Defense.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition flex items-center gap-1.5 font-bold bg-slate-900 border border-slate-800 hover:border-cyan-500/60 px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
            >
              <span>📊</span> Financial Defense ↗
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={item.name}
                aria-label={item.name}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition shadow-sm active:scale-95"
              >
                {item.icon}
              </a>
            ))}
          </div>

        </div>
      </footer>

      {/* Modal Non-Custodial Disclaimer */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#0b1222] border border-slate-700 max-w-lg w-full rounded-2xl p-6 text-slate-300 text-xs shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                🛡️ Protocol Disclaimer
              </span>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-slate-400 hover:text-white text-base font-bold px-2 py-0.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 leading-relaxed text-[11px] text-slate-400">
              <p>
                <strong className="text-slate-200">Non-Custodial Architecture:</strong> AutonPay is a decentralized, non-custodial software protocol deployed on the Solana blockchain. It never holds, controls, or escrows user funds.
              </p>
              <p>
                <strong className="text-slate-200">Autonomous Settlement:</strong> All transactions and fee distributions (vendor, protocol, and referrals) are executed deterministically on-chain via smart contracts directly between peer wallets.
              </p>
              <p>
                <strong className="text-slate-200">As-Is Software:</strong> The interface and smart contracts are provided on an "as-is" basis without warranties of any kind. Users are solely responsible for compliance with local regulations in their respective jurisdictions.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-1.5 rounded-xl transition active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}