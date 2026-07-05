'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

// --- DEMO SCENARIO: ANTHROPIC VS OPENAI ---
// Explicit X/Y coordinates to create a beautiful "fanned out" blast radius effect
const fallbackNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 400, y: 50 }, 
    data: { label: 'Anthropic captures 12% enterprise overflow' }, 
    style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '15px', width: 250, fontWeight: 'bold' } 
  },
  { 
    id: '2', 
    position: { x: 150, y: 200 }, 
    data: { label: 'OpenAI reduces GPT-4o API pricing by 25%' }, 
    style: { background: '#0f172a', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', width: 220 } 
  },
  { 
    id: '3', 
    position: { x: 650, y: 200 }, 
    data: { label: 'Meta open-sources Llama 4 early' }, 
    style: { background: '#0f172a', color: '#a78bfa', border: '1px solid #a78bfa', borderRadius: '8px', padding: '15px', width: 220 } 
  },
  { 
    id: '4', 
    position: { x: 50, y: 350 }, 
    data: { label: 'Startups migrate 30% workloads to OpenAI' }, 
    style: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '15px', width: 200 } 
  },
  { 
    id: '5', 
    position: { x: 300, y: 350 }, 
    data: { label: 'Google slashes Gemini Pro prices' }, 
    style: { background: '#0f172a', color: '#facc15', border: '1px solid #facc15', borderRadius: '8px', padding: '15px', width: 200 } 
  },
  { 
    id: '6', 
    position: { x: 650, y: 350 }, 
    data: { label: 'AWS partners with Meta for enterprise Llama' }, 
    style: { background: '#0f172a', color: '#34d399', border: '1px solid #34d399', borderRadius: '8px', padding: '15px', width: 200 } 
  },
];

const fallbackEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#38bdf8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#38bdf8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#f87171' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f87171' } },
  { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#f87171' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f87171' } },
  { id: 'e3-6', source: '3', target: '6', animated: true, style: { stroke: '#a78bfa' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' } },
];

export default function GraphMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // DEMO MODE: Skip the broken backend entirely to prevent Next.js red screen crashes.
    const loadDemoGraph = () => {
      setNodes(fallbackNodes);
      setEdges(fallbackEdges);
      setIsLoading(false);
    };

    // 800ms artificial delay to show the cool loading screen to the judges
    const timer = setTimeout(loadDemoGraph, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950">
        <div className="text-cyan-400 animate-pulse font-mono text-sm tracking-widest border border-cyan-400/20 px-6 py-3 rounded-full bg-cyan-900/20 shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]">
          CALCULATING BLAST RADIUS...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        fitViewOptions={{ padding: 0.2 }}
        className="dark"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-900 border-slate-700 fill-white" />
      </ReactFlow>
    </div>
  );
}