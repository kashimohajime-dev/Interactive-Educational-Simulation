import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EdgeFlow,
  EdgeStatus,
  ExecutionGraph,
  NodeId,
  NodeStatus,
  ScheduledEvent,
  SimulationState
} from "../types";

interface EngineApi {
  state: SimulationState;
  start: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

const emptyNodeStatus = (graph: ExecutionGraph): Record<NodeId, NodeStatus> => {
  const out = {} as Record<NodeId, NodeStatus>;
  for (const id of Object.keys(graph.nodes) as NodeId[]) {
    out[id] = "idle";
  }
  return out;
};

const emptyEdgeStatus = (graph: ExecutionGraph): Record<string, EdgeStatus> => {
  const out: Record<string, EdgeStatus> = {};
  for (const edge of graph.edges) {
    out[edge.id] = "idle";
  }
  return out;
};

export const useSimulationEngine = (graph: ExecutionGraph): EngineApi => {
  const [state, setState] = useState<SimulationState>(() => ({
    running: false,
    nowMs: performance.now(),
    totalOps: 0,
    speed: 1,
    nodeStatus: emptyNodeStatus(graph),
    edgeStatus: emptyEdgeStatus(graph),
    edgeFlows: {}
  }));

  const queueRef = useRef<ScheduledEvent[]>([]);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const edgeByFrom = useMemo(() => {
    const m: Partial<Record<NodeId, (typeof graph.edges)[number]>> = {};
    for (const edge of graph.edges) {
      m[edge.from] = edge;
    }
    return m;
  }, [graph.edges]);

  const schedule = useCallback((event: ScheduledEvent) => {
    queueRef.current.push(event);
    queueRef.current.sort((a, b) => a.atMs - b.atMs);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const processEvent = useCallback(
    (event: ScheduledEvent, nowMs: number) => {
      const speed = stateRef.current.speed;

      if (event.type === "NODE_ACTIVATE" && event.nodeId) {
        const node = graph.nodes[event.nodeId];
        setState((prev) => ({
          ...prev,
          nodeStatus: { ...prev.nodeStatus, [event.nodeId!]: "active" },
          totalOps:
            prev.totalOps +
            node.opsCost +
            Math.floor(Math.random() * Math.max(1, node.opsCost * 0.3))
        }));
        schedule({
          atMs: nowMs + node.baseLatencyMs / speed,
          type: "NODE_COMPLETE",
          nodeId: event.nodeId
        });
      }

      if (event.type === "NODE_COMPLETE" && event.nodeId) {
        setState((prev) => ({
          ...prev,
          nodeStatus: { ...prev.nodeStatus, [event.nodeId!]: "done" }
        }));
        const edge = edgeByFrom[event.nodeId];
        if (!edge) {
          setState((prev) => ({ ...prev, running: false }));
          return;
        }
        schedule({
          atMs: nowMs,
          type: "EDGE_FLOW_START",
          edgeId: edge.id
        });
      }

      if (event.type === "EDGE_FLOW_START" && event.edgeId) {
        const edge = graph.edges.find((e) => e.id === event.edgeId);
        if (!edge) {
          return;
        }
        const durationMs = edge.latencyMs / speed;
        setState((prev) => ({
          ...prev,
          edgeStatus: { ...prev.edgeStatus, [event.edgeId!]: "flowing" },
          edgeFlows: {
            ...prev.edgeFlows,
            [event.edgeId!]: { startAtMs: nowMs, durationMs } satisfies EdgeFlow
          },
          nodeStatus: { ...prev.nodeStatus, [edge.to]: "queued" }
        }));
        schedule({
          atMs: nowMs + durationMs,
          type: "EDGE_FLOW_END",
          edgeId: event.edgeId
        });
      }

      if (event.type === "EDGE_FLOW_END" && event.edgeId) {
        const edge = graph.edges.find((e) => e.id === event.edgeId);
        if (!edge) {
          return;
        }
        setState((prev) => ({
          ...prev,
          edgeStatus: { ...prev.edgeStatus, [event.edgeId!]: "done" },
          edgeFlows: { ...prev.edgeFlows, [event.edgeId!]: undefined }
        }));
        schedule({
          atMs: nowMs,
          type: "NODE_ACTIVATE",
          nodeId: edge.to
        });
      }
    },
    [edgeByFrom, graph.edges, graph.nodes, schedule]
  );

  const tick = useCallback(() => {
    const nowMs = performance.now();
    setState((prev) => ({ ...prev, nowMs }));

    while (queueRef.current.length > 0 && queueRef.current[0].atMs <= nowMs) {
      const next = queueRef.current.shift();
      if (!next) {
        break;
      }
      processEvent(next, nowMs);
    }

    if (stateRef.current.running || queueRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      stopRaf();
    }
  }, [processEvent, stopRaf]);

  const start = useCallback(() => {
    if (stateRef.current.running) {
      return;
    }
    const startAt = performance.now();
    setState((prev) => ({
      ...prev,
      running: true,
      nowMs: startAt,
      totalOps: 0,
      nodeStatus: emptyNodeStatus(graph),
      edgeStatus: emptyEdgeStatus(graph),
      edgeFlows: {}
    }));
    queueRef.current = [];
    schedule({ atMs: startAt, type: "NODE_ACTIVATE", nodeId: graph.startNode });
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [graph, schedule, tick]);

  const reset = useCallback(() => {
    queueRef.current = [];
    stopRaf();
    setState((prev) => ({
      ...prev,
      running: false,
      nowMs: performance.now(),
      totalOps: 0,
      nodeStatus: emptyNodeStatus(graph),
      edgeStatus: emptyEdgeStatus(graph),
      edgeFlows: {}
    }));
  }, [graph, stopRaf]);

  const setSpeed = useCallback((speed: number) => {
    const next = Number.isFinite(speed) ? Math.min(3, Math.max(0.5, speed)) : 1;
    setState((prev) => ({ ...prev, speed: next }));
  }, []);

  useEffect(() => stopRaf, [stopRaf]);

  return { state, start, reset, setSpeed };
};
