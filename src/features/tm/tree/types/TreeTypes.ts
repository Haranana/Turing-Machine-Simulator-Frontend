
import {type Node} from "@xyflow/react";
import { type SimulationNodeMap } from '@simulation/types/simulationTypes';

export type SimNodeComponentData = {
  nodes: SimulationNodeMap;
  currentNode: number;
  onTransitionChosen: (id: number) => void;
  statusClass: string;
  status: "ACCEPT" | "REJECT" | "HALT" | "LIMIT" | "UNKNOWN";
};

export type RfNode = Node<SimNodeComponentData>;

export type SelectedNodesAndEdges = {
  nodes: Map<number, boolean>
  edges: Map<number , boolean>
}

export type GraphData = {
  children: {id: number}[]; 
  edges: {id: number, sourceId: number, targetId: number}[]
}