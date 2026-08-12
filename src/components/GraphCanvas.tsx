'use client';

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { MousePointer, RotateCcw } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export interface GraphCanvasRef {
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
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
    const fgRef = useRef<any>(null);
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

    const zoomIn = () => {
      if (fgRef.current && typeof fgRef.current.zoom === 'function') {
        const current = fgRef.current.zoom();
        fgRef.current.zoom(current * 1.35, 300);
      }
    };

    const zoomOut = () => {
      if (fgRef.current && typeof fgRef.current.zoom === 'function') {
        const current = fgRef.current.zoom();
        fgRef.current.zoom(Math.max(0.2, current / 1.35), 300);
      }
    };

    const resetZoom = () => {
      if (fgRef.current) {
        if (typeof fgRef.current.centerAt === 'function') {
          fgRef.current.centerAt(0, 0, 400);
        }
        if (typeof fgRef.current.zoomToFit === 'function') {
          fgRef.current.zoomToFit(500, 70);
        } else if (typeof fgRef.current.zoom === 'function') {
          fgRef.current.zoom(1.0, 400);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        const node = graphData.nodes.find(n => n.id === nodeId);
        if (node && fgRef.current) {
          if (typeof fgRef.current.centerAt === 'function') {
            fgRef.current.centerAt(node.x, node.y, 600);
          }
          if (typeof fgRef.current.zoom === 'function') {
            fgRef.current.zoom(2.2, 600);
          }
        }
      },
      zoomIn,
      zoomOut,
      resetZoom,
    }));

    return (
      <main ref={containerRef} className="flex-1 relative flex flex-col bg-[#070a13] overflow-hidden select-none">
        {typeof window !== 'undefined' && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#070a13"
            nodeId="id"
            nodeLabel={(node: any) => `${node.name} (${node.category})`}
            nodeRelSize={7}
            linkSource="source"
            linkTarget="target"
            linkDirectionalArrowLength={4.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.12}
            linkColor={(link: any) => {
              if (highlightedLinks.has(link)) return '#a855f7';
              return 'rgba(51, 65, 85, 0.45)';
            }}
            linkWidth={(link: any) => (highlightedLinks.has(link) ? 3.5 : 1.2)}
            linkDirectionalParticles={(link: any) => (highlightedLinks.has(link) ? 5 : 0)}
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
              const radius = isSelected ? baseRadius * 1.35 : baseRadius;

              ctx.save();
              ctx.globalAlpha = isDimmed ? 0.16 : 1.0;

              // Glowing outer halo for active / selected nodes
              if (isSelected || (highlightedNodes.size > 0 && highlightedNodes.has(node.id))) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.35;
                ctx.fill();
                ctx.globalAlpha = isDimmed ? 0.16 : 1.0;
              }

              // Main node body
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
              ctx.lineWidth = isSelected ? 3 : 1.5;
              ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
              ctx.stroke();

              // High-clarity Node Labels
              if (globalScale > 0.8 || isHighlighted || isSelected) {
                const label = node.name;
                const fontSize = Math.max(3.5, 11.5 / globalScale);
                ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth + 8, fontSize + 4];

                ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y + radius + 4,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );

                ctx.fillStyle = isDimmed ? 'rgba(148, 163, 184, 0.3)' : '#f8fafc';
                ctx.fillText(label, node.x, node.y + radius + 4 + bckgDimensions[1] / 2);
              }

              ctx.restore();
            }}
            onNodeClick={(node: any) => onNodeClick(node)}
          />
        )}

        {/* Floating Reset View Button */}
        <button
          onClick={() => {
            resetZoom();
            onResetView();
          }}
          className="absolute top-4 right-4 z-10 px-3.5 py-2 rounded-xl bg-[#0f172a]/90 hover:bg-[#1e293b] text-gray-200 hover:text-white border border-gray-700/80 shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition active:scale-95 cursor-pointer"
          title="Reset Camera & Clear Selections"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Reset View</span>
        </button>

        {/* Real-time Interaction Hint Pill */}
        <div className="absolute bottom-4 left-4 px-3.5 py-2 rounded-xl bg-[#0f172a]/85 backdrop-blur-md border border-gray-700/80 text-[11px] text-gray-300 flex items-center gap-2.5 pointer-events-none shadow-xl font-medium">
          <MousePointer className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>Click any node to inspect prerequisite trees • Drag to reposition • Scroll to zoom</span>
        </div>
      </main>
    );
  }
);

GraphCanvas.displayName = 'GraphCanvas';
