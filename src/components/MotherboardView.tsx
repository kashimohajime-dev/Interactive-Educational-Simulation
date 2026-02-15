import { useMemo, useState } from "react";
import { EdgeFlow, EdgeStatus, ExecutionGraph, NodeId, NodeStatus } from "../types";

interface MotherboardViewProps {
  graph: ExecutionGraph;
  nodeStatus: Record<NodeId, NodeStatus>;
  edgeStatus: Record<string, EdgeStatus>;
  edgeFlows: Record<string, EdgeFlow | undefined>;
  nowMs: number;
}

const nodeColor = (kind: string): string => {
  if (kind === "hardware") return "#2dd4bf";
  if (kind === "kernel") return "#38bdf8";
  if (kind === "application") return "#f59e0b";
  return "#22c55e";
};

export const MotherboardView = ({
  graph,
  nodeStatus,
  edgeStatus,
  edgeFlows,
  nowMs
}: MotherboardViewProps) => {
  const [hovered, setHovered] = useState<NodeId | null>(null);

  const edgeLookup = useMemo(
    () =>
      graph.edges.map((edge) => ({
        ...edge,
        fromNode: graph.nodes[edge.from],
        toNode: graph.nodes[edge.to]
      })),
    [graph]
  );

  return (
    <section className="panel board-panel">
      <h2>System Flow Board</h2>
      <div className="board-wrap">
        <svg viewBox="0 0 820 480" className="board-svg" role="img" aria-label="Enter key execution path">
          <defs>
            <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x={0} y={0} width={820} height={480} fill="url(#grid)" />

          {edgeLookup.map((edge) => {
            const status = edgeStatus[edge.id];
            const flow = edgeFlows[edge.id];
            const progress =
              flow && status === "flowing"
                ? Math.max(0, Math.min(1, (nowMs - flow.startAtMs) / flow.durationMs))
                : 0;

            const x = edge.fromNode.x + (edge.toNode.x - edge.fromNode.x) * progress;
            const y = edge.fromNode.y + (edge.toNode.y - edge.fromNode.y) * progress;

            return (
              <g key={edge.id}>
                <line
                  x1={edge.fromNode.x}
                  y1={edge.fromNode.y}
                  x2={edge.toNode.x}
                  y2={edge.toNode.y}
                  className={`edge edge-${status}`}
                />
                {status === "flowing" && (
                  <circle cx={x} cy={y} r={6} className="signal-dot" filter="url(#glow)" />
                )}
              </g>
            );
          })}

          {(Object.keys(graph.nodes) as NodeId[]).map((id) => {
            const node = graph.nodes[id];
            const status = nodeStatus[id];
            const color = nodeColor(node.kind);
            return (
              <g
                key={id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered((prev) => (prev === id ? null : prev))}
                className={`node-group node-${status}`}
              >
                <circle r={30} className="node-ring" style={{ stroke: color }} />
                <circle r={22} className="node-core" style={{ fill: color }} />
                <text y={48} textAnchor="middle" className="node-label">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="tooltip">
            <strong>{graph.nodes[hovered].label}</strong>
            <p>{graph.nodes[hovered].tooltip}</p>
          </div>
        )}
      </div>
    </section>
  );
};
