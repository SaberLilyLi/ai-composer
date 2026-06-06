import type { WorkflowStepType } from "../workflow";

export interface WorkflowNode {
  id: string;
  type: WorkflowStepType;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
