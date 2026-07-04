'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType 
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

// Helper to get color based on node type
const getNodeStyle = (category: string) => {
  switch (category) {
    case 'Company': return { background: '#ef4444', border: '1px solid #7f1d1d' };
    case 'Event': return { background: '#3b82f6', border: '1px solid #1e3a8a' };
    case 'Threat': return { background: '#f59e0b', border: '1px solid #92400e' };
    default: return { background: '#1e293b', border: '1px solid #334155' };
  }
};

// Dagre layout engine
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 170, height: 60 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return { ...node, position: { x: nodeWithPosition.x - 85, y: nodeWithPosition.y - 30 } };
  });
  return { nodes: layoutedNodes, edges };
};

export default function GraphMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const [nodesRes, edgesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/nodes'),
          fetch('http://127.0.0.1:8000/api/edges')
        ]);
        
        const dbNodes = await nodesRes.json();
        const dbEdges = await edgesRes.json();

        const initialNodes = dbNodes.map((node: any) => ({
          id: node.id,
          data: { label: node.label },
          style: { ...getNodeStyle(node.category || 'default'), color: '#fff', borderRadius: '8px', padding: '10px', fontWeight: '600', fontSize: '12px' }
        }));

        const initialEdges = dbEdges.map((edge: any) => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          label: edge.relationship_type,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error("Connection failed:", err);
      }
    };
    fetchGraphData();
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
        <Background gap={20} color="#334155" />
        <Controls />
      </ReactFlow>
    </div>
  );
}