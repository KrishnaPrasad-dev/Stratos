import GraphMap from '@/components/GraphMap';

export default function Page() {
  return (
    // Changed bg-black to bg-background for theme consistency
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      
      {/* Zone 1: The Signal Feed */}
      <aside className="w-1/4 h-full border-r border-border p-6 flex flex-col">
        <h2 className="text-xl font-bold tracking-tight mb-4 text-primary">Live Signals</h2>
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-4 bg-muted rounded-lg border border-border text-sm">
            System operational...
          </div>
        </div>
      </aside>

      {/* Zone 2: The Canvas */}
      <section className="w-2/4 h-full p-4 flex flex-col relative">
        <div className="absolute top-8 left-8 z-10">
          <h1 className="text-2xl font-black tracking-widest text-foreground">STRATOS</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Ecosystem Intelligence</p>
        </div>
        
        <div className="flex-1 w-full mt-16 rounded-xl border border-border overflow-hidden">
          <GraphMap />
        </div>
      </section>

      {/* Zone 3: The Action Engine */}
      <aside className="w-1/4 h-full border-l border-border p-6 flex flex-col bg-muted/50">
        <h2 className="text-xl font-bold tracking-tight mb-4">Threat Assessment</h2>
        <div className="flex-1 text-sm text-muted-foreground">
          Select a node on the graph to analyze blast radius and generate counter-strategy.
        </div>
        <button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-colors">
          Generate Counter-Move
        </button>
      </aside>

    </main>
  );
}