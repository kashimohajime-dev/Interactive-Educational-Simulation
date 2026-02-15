export type NodeId =
  | "keyboard"
  | "keyboard_controller"
  | "hardware_interrupt"
  | "kernel_input_handler"
  | "scheduler"
  | "application_layer"
  | "cpu_fetch"
  | "cpu_decode"
  | "cpu_execute";

export type NodeKind = "hardware" | "kernel" | "application" | "cpu";
export type NodeStatus = "idle" | "queued" | "active" | "done";
export type EdgeStatus = "idle" | "flowing" | "done";

export interface GraphNode {
  id: NodeId;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  tooltip: string;
  baseLatencyMs: number;
  opsCost: number;
}

export interface GraphEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  latencyMs: number;
}

export interface ExecutionGraph {
  nodes: Record<NodeId, GraphNode>;
  edges: GraphEdge[];
  path: NodeId[];
  startNode: NodeId;
}

export interface EdgeFlow {
  startAtMs: number;
  durationMs: number;
}

export interface ScheduledEvent {
  atMs: number;
  type: "NODE_ACTIVATE" | "NODE_COMPLETE" | "EDGE_FLOW_START" | "EDGE_FLOW_END";
  nodeId?: NodeId;
  edgeId?: string;
}

export interface SimulationState {
  running: boolean;
  nowMs: number;
  totalOps: number;
  speed: number;
  nodeStatus: Record<NodeId, NodeStatus>;
  edgeStatus: Record<string, EdgeStatus>;
  edgeFlows: Record<string, EdgeFlow | undefined>;
}
