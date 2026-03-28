"use client";

import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { PackageSearch } from 'lucide-react';

interface DependencyGraphProps {
  nodes?: Node[];
  edges?: Edge[];
}

export default function DependencyGraph({ nodes = [], edges = [] }: DependencyGraphProps) {
  if (!nodes.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-950/50">
        <PackageSearch size={48} className="mb-4 opacity-50" />
        <p>No dependency tree available.</p>
        <p className="text-sm opacity-70">Scan a repository or package to generate a live threat graph.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-zinc-950"
      >
        <Background color="#3f3f46" gap={16} />
        <Controls className="fill-white bg-zinc-800 border-zinc-700" />
      </ReactFlow>
    </div>
  );
}
