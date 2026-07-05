'use client';

import React, { useState } from 'react';

export default function SignalFeed({ competitors }: { competitors?: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);

  const runDemoScan = () => {
    setIsScanning(true);
    setSignals([]); // Clear old signals
    
    // Simulate network delay for dramatic effect
    setTimeout(() => {
      setSignals([
        { id: 1, time: '10:42 AM', text: 'OpenAI reduces GPT-4o API pricing by 25%', type: 'Threat' },
        { id: 2, time: '10:45 AM', text: 'Anthropic captures 12% enterprise overflow', type: 'Opportunity' },
        { id: 3, time: '10:51 AM', text: 'Meta open-sources Llama 4 early', type: 'Event' },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Autonomous Ingestion</h3>
            <p className="text-xs text-slate-400">Targeting: {competitors || 'OpenAI, Meta'}</p>
          </div>
          <button 
            onClick={runDemoScan}
            disabled={isScanning}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Trigger Scan'}
          </button>
        </div>

        <div className="space-y-3 min-h-[200px]">
          {isScanning && (
            <div className="text-sm text-cyan-400 animate-pulse border border-cyan-500/20 bg-cyan-500/10 p-3 rounded-lg">
              Initiating deep web scrape... mapping dependencies...
            </div>
          )}
          
          {!isScanning && signals.length === 0 && (
            <div className="text-sm text-slate-500 border border-slate-800 p-3 rounded-lg">
              Awaiting scan trigger.
            </div>
          )}

          {!isScanning && signals.map((sig) => (
            <div key={sig.id} className="animate-in fade-in slide-in-from-left-4 duration-500 border-l-2 border-cyan-500 bg-slate-950 p-3 rounded-r-lg text-sm">
              <span className="text-xs text-cyan-400 font-mono block mb-1">{sig.time} | {sig.type}</span>
              <span className="text-slate-200">{sig.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
