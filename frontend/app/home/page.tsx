import Link from 'next/link';
import CardSwap, { Card } from '@/components/CardSwap'; 

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans flex flex-col overflow-hidden">
      
      {/* --- ANIMATED BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cyber-grid opacity-30"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-float"></div>
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-float animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float animation-delay-4000"></div>
      </div>
      
      {/* --- FOREGROUND CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation */}
        <nav className="w-full p-6 flex justify-between items-center border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
          <div className="text-2xl font-serif font-bold tracking-widest uppercase text-white">Stratos</div>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
            Access Platform
          </Link>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-start text-center px-6 pt-20 pb-32 max-w-7xl mx-auto w-full">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-8 border border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            System Online
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-extrabold tracking-tight mb-6 max-w-4xl drop-shadow-lg">
            Map the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Blast Radius</span> before it hits.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
            Transform scattered competitive news into a real-time, causal intelligence graph. See the unseen connections and generate strategic counter-moves instantly.
          </p>
          
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-slate-950 text-lg font-bold rounded-lg hover:bg-slate-200 transition shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 transform duration-200"
          >
            Launch Command Center
          </Link>

          {/* How It Works - 3D CardSwap Section */}
          <div className="w-full mt-32 text-left relative flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0 pr-8">
              <h2 className="text-3xl font-serif font-bold mb-4">Three Steps to Strategic Clarity.</h2>
              <p className="text-slate-400">Watch how Stratos autonomously builds your market defense map in real-time.</p>
            </div>
            
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center overflow-visible">
              <CardSwap delay={4000}>
                
                {/* CARD 1: INGEST */}
                <Card className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 flex flex-col justify-center shadow-2xl">
                  <div className="text-indigo-400 font-mono mb-4 text-xs tracking-widest">01. INGEST</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Autonomous Scraping</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Feed Stratos your target market. Our agents continuously parse the web for pricing changes, executive hires, and product launches.
                  </p>
                </Card>

                {/* CARD 2: MAP */}
                <Card className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 flex flex-col justify-center shadow-2xl">
                  <div className="text-cyan-400 font-mono mb-4 text-xs tracking-widest">02. MAP</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Causality Network</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Raw intelligence is automatically converted into an interactive Node-Edge graph, revealing second-order market effects.
                  </p>
                </Card>

                {/* CARD 3: ACT */}
                <Card className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 flex flex-col justify-center shadow-2xl">
                  <div className="text-emerald-400 font-mono mb-4 text-xs tracking-widest">03. ACT</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Counter-Move Engine</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Click any threat node on the canvas to generate AI-calculated tactical responses to protect your market share.
                  </p>
                </Card>

              </CardSwap>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}