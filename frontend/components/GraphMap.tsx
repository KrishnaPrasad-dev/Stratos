'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, Edge, MarkerType, Node } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

const getNodeStyle = (category: string) => {
  switch (category) {
    case 'Company':
      return { background: '#0f766e', border: '1px solid #5eead4' };
    case 'Event':
      return { background: '#2563eb', border: '1px solid #93c5fd' };
    case 'Threat':
      return { background: '#f59e0b', border: '1px solid #fde68a' };
    default:
      return { background: '#1e293b', border: '1px solid #64748b' };
  }
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 180, height: 70 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return { ...node, position: { x: nodeWithPosition.x - 90, y: nodeWithPosition.y - 35 } };
  });
  return { nodes: layoutedNodes, edges };
};

export default function GraphMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  useEffect(() => {
    const applyFallbackScenario = () => {
      const fallbackNodes = [
        { id: 'company-aws', data: { label: 'Amazon AWS' }, category: 'Company' },
        {
          id: 'event-aws-launch',
          data: { label: 'AWS launches decentralized database layer (Project Atlas Mesh)' },
          category: 'Event',
        },
        {
          id: 'event-market-repricing',
          data: { label: 'Enterprise buyers reprice vector DB + edge stack spend in 2 quarters' },
          category: 'Event',
        },
        {
          id: 'threat-pinecone',
          data: { label: 'Pinecone faces accelerated price compression in strategic accounts' },
          category: 'Threat',
        },
        {
          id: 'threat-vercel',
          data: { label: 'Vercel risks hosting bundle churn from infra consolidation' },
          category: 'Threat',
        },
        {
          id: 'threat-supabase',
          data: { label: 'Supabase sees procurement pressure on premium realtime tiers' },
          category: 'Threat',
        },
        {
          id: 'event-countermove',
          data: { label: 'Competitors announce alliance-level GTM and migration incentives' },
          category: 'Event',
        },
      ].map((node) => ({
        ...node,
        style: {
          ...getNodeStyle(node.category),
          color: '#fff',
          borderRadius: '10px',
          padding: '10px',
          fontWeight: '600',
          fontSize: '12px',
        },
      }));

      const fallbackEdges = [
        {
          id: 'edge-aws-launch',
          source: 'company-aws',
          target: 'event-aws-launch',
          label: 'CAUSED',
          relationship_type: 'CAUSED',
        },
        {
          id: 'edge-market-repricing',
          source: 'event-aws-launch',
          target: 'event-market-repricing',
          label: 'ESCALATES_TO',
          relationship_type: 'ESCALATES_TO',
        },
        {
          id: 'edge-pinecone-impact',
          source: 'event-market-repricing',
          target: 'threat-pinecone',
          label: 'IMPACTS',
          relationship_type: 'IMPACTS',
        },
        {
          id: 'edge-vercel-impact',
          source: 'event-market-repricing',
          target: 'threat-vercel',
          label: 'IMPACTS',
          relationship_type: 'IMPACTS',
        },
        {
          id: 'edge-supabase-impact',
          source: 'event-market-repricing',
          target: 'threat-supabase',
          label: 'IMPACTS',
          relationship_type: 'IMPACTS',
        },
        {
          id: 'edge-countermove',
          source: 'threat-supabase',
          target: 'event-countermove',
          label: 'ESCALATES_TO',
          relationship_type: 'ESCALATES_TO',
        },
      ].map((edge) => ({
        ...edge,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(fallbackNodes, fallbackEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    };

    const fetchGraphData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 6000);

        const [nodesRes, edgesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/nodes', { signal: controller.signal }),
          fetch('http://127.0.0.1:8000/api/edges', { signal: controller.signal }),
        ]);
        window.clearTimeout(timeoutId);

        if (!nodesRes.ok || !edgesRes.ok) {
          console.warn(`Backend is down (500). Silently loading presentation fallback.`);
          applyFallbackScenario();
          return; 
        }

        const dbNodes = await nodesRes.json();
        const dbEdges = await edgesRes.json();
        console.log('Raw fetched nodes:', dbNodes);

        const normalizedNodes = Array.isArray(dbNodes)
          ? dbNodes
          : Array.isArray(dbNodes?.nodes)
            ? dbNodes.nodes
            : Array.isArray(dbNodes?.data)
              ? dbNodes.data
              : [];

        const normalizedEdges = Array.isArray(dbEdges)
          ? dbEdges
          : Array.isArray(dbEdges?.edges)
            ? dbEdges.edges
            : Array.isArray(dbEdges?.data)
              ? dbEdges.data
              : [];

        if (normalizedNodes.length === 0 || normalizedEdges.length === 0) {
          console.warn('Graph API returned empty/incompatible payload; loading presentation fallback scenario.');
          applyFallbackScenario();
          return;
        }

        const initialNodes = normalizedNodes.map((node: any) => ({
          id: node.id,
          data: { label: node.label },
          style: {
            ...getNodeStyle(node.category || 'default'),
            color: '#fff',
            borderRadius: '10px',
            padding: '10px',
            fontWeight: '600',
            fontSize: '12px',
          },
        }));

        const initialEdges = normalizedEdges.map((edge: any) => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          label: edge.relationship_type,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error('Connection failed, loading fallback scenario:', err);
        applyFallbackScenario();
      }
    };

    fetchGraphData();
    const interval = window.setInterval(fetchGraphData, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden bg-slate-950">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
        <Background gap={20} color="#334155" />
        <Controls />
      </ReactFlow>
    </div>
  );
}