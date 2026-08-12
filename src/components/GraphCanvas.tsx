'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, Maximize, RotateCcw, MousePointer } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

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

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  highlightedNodes,
  highlightedLinks,
  activePath,
  onNodeClick,
  onResetView,
}) => {
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

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
  };

  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(400, 50);
  };

  return (
    <main ref={containerRef} className="flex-1 relative flex flex-col bg-[#070A12] overflow-hidden">
      {typeof window !== 'undefined' && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#070A12"
          nodeId="id"
          nodeLabel={(node: any) => `${node.name} (${node.category})`}
          nodeRelSize={7}
          linkSource="source"
          linkTarget="target"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.1}
          linkColor={(link: any) => {
            if (highlightedLinks.has(link)) return '#a855f7';
            return 'rgba(75, 85, 99, 0.35)';
          }}
          linkWidth={(link: any) => (highlightedLinks.has(link) ? 3 : 1)}
          linkDirectionalParticles={(link: any) => (highlightedLinks.has(link) ? 4 : 0)}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleSpeed={0.008}
          linkDirectionalParticleColor={() => '#38bdf8'}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
            const isDimmed = highlightedNodes.size > 0 && !highlightedNodes.has(node.id);
            const isSelected = activePath.includes(node.id);

            const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Default;
            const baseRadius = node.label === 'JobRole' ? 9 : node.label === 'Course' ? 5 : 6;
            const radius = isSelected ? baseRadius * 1.4 : baseRadius;

            ctx.save();
            ctx.globalAlpha = isDimmed ? 0.18 : 1.0;

            if (isSelected || (highlightedNodes.size > 0 && highlightedNodes.has(node.id))) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.globalAlpha = 0.25;
              ctx.fill();
              ctx.globalAlpha = isDimmed ? 0.18 : 1.0;
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)';
            ctx.stroke();

            if (globalScale > 0.85 || isHighlighted || isSelected) {
              const label = node.name;
              const fontSize = Math.max(3, 11 / globalScale);
              ctx.font = `600 ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth + 6, fontSize + 3];

              ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y + radius + 3,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              ctx.fillStyle = isDimmed ? 'rgba(156, 163, 175, 0.3)' : '#f3f4f6';
              ctx.fillText(label, node.x, node.y + radius + 3 + bckgDimensions[1] / 2);
            }

            ctx.restore();
          }}
          onNodeClick={(node: any) => onNodeClick(node)}
        />
      )}

      {/* Control Overlay Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="w-8 h-8 rounded-lg bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition"
          title="Center & Fit"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          onClick={onResetView}
          className="w-8 h-8 rounded-lg bg-gray-900/90 border border-gray-700/80 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Helper text */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-gray-900/70 backdrop-blur-md border border-gray-800/80 text-[11px] text-gray-400 flex items-center gap-2 pointer-events-none">
        <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
        <span>Click any node to inspect prerequisites & courses • Drag to reposition • Scroll to zoom</span>
      </div>
    </main>
  );
};
