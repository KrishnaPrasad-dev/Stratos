'use client';

import { useState } from 'react';

interface StartupSetupFormProps {
  onSaved?: (payload: StartupSetupPayload) => void;
}

export interface StartupSetupPayload {
  company: string;
  category: string;
  competitors: string;
  company_name?: string;
  target_competitors?: string[];
}

export default function StartupSetupForm({ onSaved }: StartupSetupFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('AI');
  const [competitors, setCompetitors] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCompetitors = competitors
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const payload: StartupSetupPayload = {
      company: companyName,
      category,
      competitors: normalizedCompetitors.join(', '),
      company_name: companyName,
      target_competitors: normalizedCompetitors,
    };

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName, category, competitors: normalizedCompetitors.join(', ') }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error('Unexpected response');
      }

      setSuccess('Setup saved successfully!');
      onSaved?.(payload);
    } catch (err) {
      console.error(err);
      setError('Setup could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-2xl shadow-black/20">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-400">Company</label>
        <input
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Northstar Labs"
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 outline-none ring-0"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-400">Category</label>
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="AI, Fintech, Health"
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 outline-none ring-0"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-400">Target Competitors</label>
        <input
          value={competitors}
          onChange={(event) => setCompetitors(event.target.value)}
          placeholder="Acme, Nova, Aster"
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 outline-none ring-0"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-cyan-500 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? 'Saving...' : 'Save Startup Setup'}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    </form>
  );
}
