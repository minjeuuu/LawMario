import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  ArrowRight,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  LABOR_KNOWLEDGE_GRAPH_NODES,
  LABOR_KNOWLEDGE_GRAPH_EDGES,
  KnowledgeGraphNode,
} from '../utils/ghostRaceAndKnowledgeGraph';
import { marioAudio } from '../utils/audio';

interface LaborLawKnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds?: string[];
  onSelectTopicModule?: (topicId: string, worldId: string) => void;
}

const WORLD_FILTER_OPTIONS = [
  { id: 'all', label: 'All 6 Worlds' },
  { id: 'world1', label: 'World 1: Hours & OT' },
  { id: 'world2', label: 'World 2: Holidays & 13th' },
  { id: 'world3', label: 'World 3: Wages & D.O. 174' },
  { id: 'world4', label: 'World 4: Special Groups' },
  { id: 'world5', label: 'World 5: Security of Tenure' },
  { id: 'world6', label: 'World 6: Statutory Leaves' },
];

export const LaborLawKnowledgeGraphModal: React.FC<LaborLawKnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  completedTopicIds = [],
  onSelectTopicModule,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    LABOR_KNOWLEDGE_GRAPH_NODES[0]?.id || 'kg_hours'
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeGraphNode>();
    for (const n of LABOR_KNOWLEDGE_GRAPH_NODES) {
      map.set(n.id, n);
    }
    return map;
  }, []);

  const selectedNode =
    nodeMap.get(selectedNodeId) || LABOR_KNOWLEDGE_GRAPH_NODES[0] || null;

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return LABOR_KNOWLEDGE_GRAPH_EDGES.filter(
      (e) => e.from === selectedNode.id || e.to === selectedNode.id
    );
  }, [selectedNode]);

  if (!isOpen) return null;

  const q = searchQuery.trim().toLowerCase();

  const handleZoomBy = (delta: number) => {
    setZoom((z) => Math.min(2.4, Math.max(0.55, Number((z + delta).toFixed(2)))));
    marioAudio.playClick();
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setWorldFilter('all');
    setSearchQuery('');
    marioAudio.playPipe();
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.14 : -0.14;
    setZoom((z) => Math.min(2.4, Math.max(0.55, Number((z + delta).toFixed(2)))));
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement).closest('button, g[data-graph-node="true"]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const stopDragging = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Labor Law Knowledge Graph"
      data-testid="knowledge-graph-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain print:hidden"
    >
      <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-5xl w-full shadow-[10px_10px_0_#000] text-white my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-cyan-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Network className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-cyan-300 font-mario block leading-tight">
                INTERACTIVE SVG CONCEPT TOPOLOGY (PAN &amp; ZOOM)
              </span>
              <h2 className="text-base sm:text-xl font-black font-display text-white break-words [overflow-wrap:anywhere] leading-tight">
                LABOR LAW STATUTORY KNOWLEDGE GRAPH
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Knowledge Graph"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          data-testid="knowledge-graph-scroll-body"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 custom-scrollbar"
        >
          {/* Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                data-testid="knowledge-graph-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter nodes by Article, R.A., or concept..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white placeholder-slate-400 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                data-testid="kg-zoom-out"
                onClick={() => handleZoomBy(-0.2)}
                aria-label="Zoom out graph"
                className="min-h-[34px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>-</span>
              </button>
              <span
                data-testid="kg-zoom-readout"
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-black text-cyan-300 tabular-nums"
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                data-testid="kg-zoom-in"
                onClick={() => handleZoomBy(0.2)}
                aria-label="Zoom in graph"
                className="min-h-[34px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>+</span>
              </button>
              <button
                type="button"
                data-testid="kg-reset-view"
                onClick={handleResetView}
                className="min-h-[34px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-black text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* World Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {WORLD_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setWorldFilter(opt.id);
                  marioAudio.playClick();
                }}
                className={`min-h-[32px] px-3 py-1 rounded-xl text-xs font-black border whitespace-nowrap cursor-pointer shrink-0 transition-colors ${
                  worldFilter === opt.id
                    ? 'bg-cyan-400 text-slate-950 border-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Interactive SVG Canvas + Selected Node Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Interactive Pan & Zoom SVG Stage */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              data-testid="knowledge-graph-viewport"
              className={`lg:col-span-2 bg-[#080f1f] border-3 border-slate-800 rounded-2xl overflow-hidden relative select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ height: '420px' }}
            >
              <div className="absolute top-2.5 left-3 z-10 bg-slate-950/85 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 pointer-events-none">
                Drag canvas to pan · Scroll or +/- to zoom · Click any node
              </div>

              <svg
                data-testid="knowledge-graph-svg"
                viewBox="0 0 980 700"
                className="w-full h-full"
              >
                <defs>
                  <marker
                    id="kg-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                  </marker>
                  <marker
                    id="kg-arrow-active"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                  </marker>
                </defs>

                <g
                  transform={`translate(${490 + pan.x}, ${350 + pan.y}) scale(${zoom}) translate(-490, -350)`}
                >
                  {/* Edges */}
                  {LABOR_KNOWLEDGE_GRAPH_EDGES.map((edge) => {
                    const fromNode = nodeMap.get(edge.from);
                    const toNode = nodeMap.get(edge.to);
                    if (!fromNode || !toNode) return null;
                    const isHighlighted =
                      selectedNode &&
                      (edge.from === selectedNode.id || edge.to === selectedNode.id);

                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={isHighlighted ? '#fbbf24' : '#334155'}
                          strokeWidth={isHighlighted ? 3 : 1.75}
                          strokeDasharray={edge.relation === 'contrasts' ? '6 4' : undefined}
                          markerEnd={isHighlighted ? 'url(#kg-arrow-active)' : 'url(#kg-arrow)'}
                        />
                        {isHighlighted && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x={-68}
                              y={-11}
                              width={136}
                              height={20}
                              rx={6}
                              fill="#0f172a"
                              stroke="#fbbf24"
                              strokeWidth={1}
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#fde68a"
                              fontSize="10"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {edge.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {LABOR_KNOWLEDGE_GRAPH_NODES.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isMastered = completedTopicIds.includes(node.topicId);
                    const matchesWorld =
                      worldFilter === 'all' || node.worldId === worldFilter;
                    const matchesSearch =
                      !q ||
                      node.label.toLowerCase().includes(q) ||
                      node.citation.toLowerCase().includes(q);
                    const isDimmed = !matchesWorld || !matchesSearch;

                    return (
                      <g
                        key={node.id}
                        data-graph-node="true"
                        data-testid={`kg-node-${node.id}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          marioAudio.playCoin();
                        }}
                        style={{
                          cursor: 'pointer',
                          opacity: isDimmed ? 0.25 : 1,
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        {isSelected && (
                          <circle
                            r={44}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth={3}
                            strokeDasharray="5 3"
                          />
                        )}
                        <circle
                          r={34}
                          fill={node.color}
                          stroke={isSelected ? '#ffffff' : '#020617'}
                          strokeWidth={isSelected ? 4 : 3}
                        />
                        <text
                          y={-6}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          W{node.worldNumber}
                        </text>
                        <text
                          y={10}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="9.5"
                          fontWeight="800"
                        >
                          {node.citation.slice(0, 11)}
                        </text>
                        {isMastered && (
                          <circle
                            cx={24}
                            cy={-24}
                            r={9}
                            fill="#10b981"
                            stroke="#020617"
                            strokeWidth={2}
                          />
                        )}
                        <rect
                          x={-84}
                          y={40}
                          width={168}
                          height={22}
                          rx={6}
                          fill={isSelected ? '#fbbf24' : '#0f172a'}
                          stroke={isSelected ? '#000000' : '#334155'}
                          strokeWidth={1.5}
                        />
                        <text
                          x={0}
                          y={52}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isSelected ? '#020617' : '#e2e8f0'}
                          fontSize="10"
                          fontWeight="800"
                        >
                          {node.label.length > 26
                            ? `${node.label.slice(0, 24)}...`
                            : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Selected Node Doctrine Inspector */}
            {selectedNode && (
              <div
                data-testid="kg-node-inspector"
                className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-4 space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mario text-white border border-black"
                      style={{ backgroundColor: selectedNode.color }}
                    >
                      WORLD {selectedNode.worldNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {selectedNode.citation}
                    </span>
                  </div>
                  <h3 className="text-base font-black font-display text-white leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mario block">
                    CONNECTED DOCTRINAL LINKS ({connectedEdges.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {connectedEdges.map((edge) => {
                      const peerId =
                        edge.from === selectedNode.id ? edge.to : edge.from;
                      const peer = nodeMap.get(peerId);
                      if (!peer) return null;
                      return (
                        <button
                          key={edge.id}
                          type="button"
                          onClick={() => {
                            setSelectedNodeId(peer.id);
                            marioAudio.playClick();
                          }}
                          className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
                            <span className="uppercase">{edge.relation}</span>
                            <span>{edge.label}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-200 break-words [overflow-wrap:anywhere] leading-snug">
                            {peer.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {onSelectTopicModule && (
                  <button
                    type="button"
                    data-testid="kg-open-module-btn"
                    onClick={() => {
                      marioAudio.playPipe();
                      onClose();
                      onSelectTopicModule(selectedNode.topicId, selectedNode.worldId);
                    }}
                    className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Open Topic Card in World {selectedNode.worldNumber}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
