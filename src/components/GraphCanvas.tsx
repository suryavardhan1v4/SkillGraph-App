'use client';

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize, RotateCcw, MousePointer, Activity } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export interface GraphCanvasRef {
  focusNode: (nodeId: string) => void;
}

interface GraphCanvasProps {
  graphData: { nodes: any[]; links: any[] };
  highlightedNodes: Set<string>;
  highlightedLinks: Set<any>;
  activePath: string[];
  onNodeClick: (node: any) => void;
  onResetView: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI & ML': '#a855f7',
  'Core Programming': '#6366f1',
  'Backend & Cloud': '#06b6d4',
  'Frontend': '#10b981',
  'Data Engineering': '#f43f5e',
  'JobRole': '#f59e0b',
  'Course': '#3b82f6',
  Default: '#94a3b8',
};

export const GraphCanvas = forwardRef<GraphCanvasRef, GraphCanvasProps>(
  ({ graphData, highlightedNodes, highlightedLinks, activePath, onNodeClick, onResetView }, ref) => {
    const fgRef = useRef<any>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
      function updateDimensions() {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      }

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        const node = graphData.nodes.find(n => n.id === nodeId);
        if (node && fgRef.current) {
          fgRef.current.centerAt(node.x, node.y, 600);
          fgRef.current.zoom(2.2, 600);
        }
      },
    }));

    const handleZoomIn = () => {
      if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
    };

    const handleZoomOut = () => {
      if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
    };

    const handleFit = () => {
      if (fgRef.current) fgRef.current.zoomToFit(500, 40);
    };

    return (
      <main ref={containerRef} className="flex-1 relative flex flex-col bg-[#060913] overflow-hidden">
        {typeof window !== 'undefined' && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#060913"
            nodeId="id"
            nodeLabel={(node: any) => `${node.name} (${node.category})`}
            nodeRelSize={7}
            linkSource="source"
            linkTarget="target"
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.12}
            linkColor={(link: any) => {
              if (highlightedLinks.has(link)) return '#a855f7';
              return 'rgba(51, 65, 85, 0.4)';
            }}
            linkWidth={(link: any) => (highlightedLinks.has(link) ? 3.5 : 1)}
            linkDirectionalParticles={(link: any) => (highlightedLinks.has(link) ? 4 : 0)}
            linkDirectionalParticleWidth={3.5}
            linkDirectionalParticleSpeed={0.009}
            linkDirectionalParticleColor={() => '#38bdf8'}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
              const isDimmed = highlightedNodes.size > 0 && !highlightedNodes.has(node.id);
              const isSelected = activePath.includes(node.id);

              const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Default;
              const baseRadius = node.label === 'JobRole' ? 9.5 : node.label === 'Course' ? 5 : 6.5;
              const radius = isSelected ? baseRadius * 1.4 : baseRadius;

              ctx.save();
              ctx.globalAlpha = isDimmed ? 0.16 : 1.0;

              // Outer glow halo for selected or active nodes
              if (isSelected || (highlightedNodes.size > 0 && highlightedNodes.has(node.id))) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.35;
                ctx.fill();
                ctx.globalAlpha = isDimmed ? 0.16 : 1.0;
              }

              // Main node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
              ctx.lineWidth = isSelected ? 2.5 : 1.5;
              ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.45)';
              ctx.stroke();

              // High-clarity Node Labels
              if (globalScale > 0.85 || isHighlighted || isSelected) {
                const label = node.name;
                const fontSize = Math.max(3.5, 11.5 / globalScale);
                ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth + 8, fontSize + 4];

                ctx.fillStyle = 'rgba(8, 13, 26, 0.9)';
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y + radius + 4,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );

                ctx.fillStyle = isDimmed ? 'rgba(148, 163, 184, 0.25)' : '#f8fafc';
                ctx.fillText(label, node.x, node.y + radius + 4 + bckgDimensions[1] / 2);
              }

              ctx.restore();
            }}
            onNodeClick={(node: any) => onNodeClick(node)}
          />
        )}

        {/* Floating Controls HUD */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-xl transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-xl transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="w-9 h-9 rounded-xl bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-xl transition"
            title="Fit to Screen"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={onResetView}
            className="w-9 h-9 rounded-xl bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-xl transition"
            title="Reset Filters & View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Interaction Hint Pill */}
        <div className="absolute bottom-4 left-4 px-3.5 py-2 rounded-xl bg-gray-900/80 backdrop-blur-md border border-gray-800/90 text-[11px] text-gray-300 flex items-center gap-2.5 pointer-events-none shadow-lg">
          <MousePointer className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>Click any node to inspect prerequisite trees • Drag to reposition • Scroll to zoom</span>
        </div>
      </main>
    );
  }
);

GraphCanvas.displayName = 'GraphCanvas';
