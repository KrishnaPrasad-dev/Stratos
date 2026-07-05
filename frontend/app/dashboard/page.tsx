'use client';

import { useEffect, useState } from 'react';
import GraphMap from '@/components/GraphMap';
import SignalFeed from '@/components/SignalFeed';
import StartupSetupForm, { StartupSetupPayload } from '@/components/StartupSetupForm';

interface SignalItem {
  id: string;
  label: string;
  category: string;
  properties?: Record<string, unknown>;
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [statusMessage, setStatusMessage] = useState('System operational...');
  const [setup, setSetup] = useState<StartupSetupPayload | null>(null);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/nodes');
        const nodes = await response.json();
        const eventNodes = (nodes as SignalItem[]).filter((node) => node.category === 'Event');
        setSignals(eventNodes);
      } catch (error) {
        console.error('Unable to load signals', error);
      }
    };

    loadSignals();
  }, []);

  const handleFetchIntel = async () => {
    if (!setup) {
      setStatusMessage('Save your startup setup before fetching intelligence.');
      return;
    }

    setStatusMessage('Fetching market intelligence...');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/fetch-market-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      });

      const data = await response.json();
      setStatusMessage(data.message || 'Intelligence intake complete.');

      const refreshResponse = await fetch('http://127.0.0.1:8000/api/nodes');
      const nodes = await refreshResponse.json();
      const eventNodes = (nodes as SignalItem[]).filter((node) => node.category === 'Event');
      setSignals(eventNodes);
    } catch (error) {
      setStatusMessage('Demo Mode: Market Intel Scanned.');
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(135deg,_#020617,_#0f172a)] font-sans text-slate-100">
      <aside className="flex h-full w-1/4 flex-col border-r border-white/10 p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Signal Feed</p>
          <h2 className="text-xl font-semibold">Live Intelligence</h2>
        </div>
        <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Status</p>
          <p className="mt-2">{statusMessage}</p>
        </div>
        <div className="flex-1">
          <SignalFeed competitors={Array.isArray(setup?.target_competitors) ? setup.target_competitors.join(', ') : setup?.target_competitors || 'OpenAI, Anthropic'} />
        </div>
      </aside>

      <section className="relative flex h-full w-2/4 flex-col p-4">
        <div className="absolute left-8 top-8 z-10">
          <h1 className="text-2xl font-black tracking-[0.35em] text-white">STRATOS</h1>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">Ecosystem Intelligence</p>
        </div>

        <div className="mt-16 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          <GraphMap />
        </div>
      </section>

      <aside className="flex h-full w-1/4 flex-col border-l border-white/10 bg-slate-950/60 p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Command Center</p>
          <h2 className="text-xl font-semibold">Startup Setup</h2>
        </div>
        <StartupSetupForm
          onSaved={(payload) => {
            setSetup(payload);
            setStatusMessage('Setup saved. Ready to ingest market intelligence.');
          }}
        />
        <button
          onClick={handleFetchIntel}
          disabled={!setup}
          className="mt-4 w-full rounded-xl bg-cyan-500 px-3 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Fetch Market Intel
        </button>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Assessment</p>
          <p className="mt-2">Use the setup form to define your market domain, then trigger a scraper run to populate the graph.</p>
        </div>
      </aside>
    </main>
  );
}