import "./tree.css"

import '@xyflow/react/dist/style.css';
import {useEffect, useRef, useState } from "react";
import { ReactFlow,Background,useNodesState,useEdgesState,type Node,type Edge, type NodeProps, type NodeTypes, Handle, Position} from "@xyflow/react";
import { type SimulationNode , type SimulationNodeMap } from '../features/Tape/simulationTypes';
import ELK, {type ElkNode } from "elkjs/lib/elk.bundled.js";
import { useSimulationData } from "../features/GlobalData/GlobalData";
import { NdSimulation } from '../features/Tape/Simulation';
import { CheckIcon, ExclamationCircleIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Sitemap } from '../assets/Sitemap';

const elk  = new ELK();

const nodeTypes : NodeTypes = {
  simNode: SimulationNodeComponent,
};

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

export default function TreePage(){

  const [nodes, setNodes, onNodesChange] = useNodesState<RfNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {simulationDataNodes, simulationDataNodesPath, setSimulationDataNodesPath} = useSimulationData();
  const [_, setSimulation] = useState<NdSimulation | null>(null);
  const [__ , setSelectedNodesAndEdges] = useState<SelectedNodesAndEdges>({nodes: new Map<number, boolean>() , edges: new Map<number, boolean>()})
  const graphData = useRef<GraphData>({children: [], edges: []});
  const [___, setElkGraph] = useState<ElkNode>();

  //call at start of the component (just after simulationData is loaded)
  //create simulation based on zustand data
  //convert simulation data to graphData, digestable by elk
  //create maps of which nodes and edges are in path
  //create elk layout of graph
  //based on the layout create react flow graph
  useEffect(() => {
    if(!simulationDataNodes) return;
    const newSimulation = new NdSimulation(simulationDataNodes)
    //console.log("current path: ", simulationPath);
    setSimulation(newSimulation);

    const startingGraphData = simulationToGraphChildren(newSimulation);
    graphData.current = startingGraphData;

    const initialSelected = graphDataToSelectedNodesAndEdges(startingGraphData);

      const newElkGraph = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "mrtree",
            "elk.direction": "DOWN",
            "elk.spacing.nodeNode": "100",
            "elk.layered.spacing.nodeNodeBetweenLayers": "80",
            "elk.layered.spacing.edgeEdgeBetweenLayers": "20",
        },
        children: startingGraphData.children.map((n) => ({
            id: n.id.toString(),
            width: 100,
            height: 100,
        })),
        edges: startingGraphData.edges.map((e) => ({
            id: e.id.toString(),
            sources: [e.sourceId.toString()],
            targets: [e.targetId.toString()],
        })),
      };
      setElkGraph(newElkGraph)

    //create layout and fill react flow page
    const getLayout = async () => {
      const res = await elk.layout(newElkGraph);

      const elkNodes: RfNode[] =
        res.children?.map(node => {
          const simNode = newSimulation.nodes.get(Number(node.id))!;
          const output = simNode.output;

          const status: SimNodeComponentData["status"] =
            output === "ACCEPT" ? "ACCEPT" :
            output === "REJECT" ? "REJECT" :
            output === "HALT"   ? "HALT"   :
            output === "LIMIT"  ? "LIMIT"  :
            "UNKNOWN";

          const statusClass =
            status === "ACCEPT" ? "NodeAccept" :
            status === "REJECT" ? "NodeReject" :
            status === "HALT"   ? "NodeHalt"   :
            status === "LIMIT"  ? "NodeLoop"   :
            "";

          const selected = initialSelected.nodes.get(Number(node.id)) === true;

          return {
            id: node.id.toString(),
            type: "simNode",
            position: { x: node.x ?? 0, y: node.y ?? 0 },
            data: {
              nodes: newSimulation.nodes,
              currentNode: Number(node.id),
              onTransitionChosen,
              statusClass,
              status,
            },
            draggable: false,
            className: `${statusClass} ${selected ? "SelectedNode" : ""}`.trim(),
          };
        }) ?? [];

      const elkEdges: Edge[] =
        res.edges?.map(edge => {
          const selected = initialSelected.edges.get(Number(edge.id)) === true;

          return {
            id: edge.id,
            source: edge.sources[0],
            target: edge.targets[0],
            type: "straight",
            className: selected
              ? "SimulationEdge SelectedEdge"
              : "SimulationEdge",
          };
        }) ?? [];

      setNodes(elkNodes);
      setEdges(elkEdges);
    };
    getLayout();

  }, [setNodes, setEdges, simulationDataNodes]);

  function updateNodesAndEdgedClasses(selectedNodes: Map<number, boolean> , selectedEdges: Map<number, boolean>){
    console.log("updateNodesAndEdgedClasses,  selectedNodes: ", selectedNodes, "\nselectedEdges: ", selectedEdges )
        setNodes(prev =>
    prev.map(n => {
      const selected = selectedNodes.get(Number(n.id)) === true;
      const base = n.data.statusClass ?? "";
      return {
        ...n,
        className: `${base} ${selected ? "SelectedNode" : ""}`.trim(),
      };
    })
  );

  setEdges(eds =>
    eds.map(e => ({
      ...e,
      className: selectedEdges.get(Number(e.id)) === true
        ? "SimulationEdge SelectedEdge"
        : "SimulationEdge",
    }))
  );
  }

  //NdSimulation to GraphData to be used by elk to create graph layout
  function simulationToGraphChildren(currentSimulation: NdSimulation): GraphData{
    let out: GraphData = {children: [], edges: []};
    //if(!currentSimulation) return out;
    
    //create node from each branching
    currentSimulation.nodes.forEach((value,_)=>{
      if(value.nextIds.length == 1) return ; //not interested in nodes that arent branches or leaves
      const currentSimulationNode: SimulationNode = value;
      out.children.push({id: currentSimulationNode.id});

      //create edge beetwen this node and its children's first branching or leaf (or not if its already a leaf)
      currentSimulationNode.nextIds.forEach((childId: number)=>{
        const newEdgeId = out.edges.length;
        let childFirstBranchId = childId;
        while(true){
          const potentialBranch = currentSimulation.nodes.get(childFirstBranchId)!;
          if(potentialBranch.nextIds.length == 0 || potentialBranch.nextIds.length > 1){
            break;
          }
          childFirstBranchId = potentialBranch.nextIds[0];
        }

        out.edges.push({id: newEdgeId, 
            sourceId:currentSimulationNode.id,
            targetId:childFirstBranchId,
        })
      });

    });
    return out;
  }

  //creates starting values of selectedNodesAndEdges, based on path from zustand,
  function graphDataToSelectedNodesAndEdges(currentGraphData: GraphData): SelectedNodesAndEdges {
  const nodes = new Map<number, boolean>();
  const edges = new Map<number, boolean>();

  const nodeInPath = (id: number) => simulationDataNodesPath.includes(id);

  const edgeInPath = (sourceId: number, targetId: number) => {
    const sIn = simulationDataNodesPath.includes(sourceId);
    const tIn = simulationDataNodesPath.includes(targetId);
    return sIn && tIn;
  };

  currentGraphData.children.forEach(node => {
    nodes.set(node.id, nodeInPath(node.id));
  });

  currentGraphData.edges.forEach(edge => {
    edges.set(edge.id, edgeInPath(edge.sourceId, edge.targetId));
  });

  const selected: SelectedNodesAndEdges = { nodes, edges };
  setSelectedNodesAndEdges(selected);
  return selected;
}

/*
  function isNodeSelected(nodeId: number) {
  return selectedNodesAndEdges.nodes.get(nodeId) === true;
}

  function isEdgeSelected(edgeId: number) {
    return selectedNodesAndEdges.edges.get(edgeId) === true;
  }
*/

  //creates path based on chosen transition
    //any transition can be selected, so each time onTransitionChosen is called
    //path must be cleared and build from the root
    const onTransitionChosen = (nodesMapChildId: number) => {
      console.log("[otc]: chosen:", nodesMapChildId);

     
      if(simulationDataNodes==null){
        console.log("simulation is null lmao");
        return;
      }
       const simulation = new NdSimulation(simulationDataNodes);
      

      let newPath = [];
      newPath.push(nodesMapChildId);

      //from start to new node
      let currentNode: SimulationNode = simulation.nodes.get(nodesMapChildId)!;
      while(currentNode.prevId != null){
          currentNode = simulation.nodes.get(currentNode.prevId)!;
          newPath.unshift(currentNode.id);
      }
      
      //from new node to first branching
      currentNode = simulation.nodes.get(nodesMapChildId)!;
      while(currentNode.nextIds.length === 1){
        currentNode = simulation.nodes.get(currentNode.nextIds[0])!;
        newPath.push(currentNode.id);
      }

      //update selected nodes and edges state
          let nodes = new Map<number, boolean>()
      let edges = new Map<number, boolean>()

      const nodeInPath = (id: number) => newPath.includes(id);

      const edgeInPath = (sourceId: number, targetId: number) => {
        const sIn = newPath.includes(sourceId);
        const tIn = newPath.includes(targetId);
        return sIn && tIn;
      };

      console.log("graphData: ", graphData);

      graphData.current.children.forEach((node)=>{
        if(nodeInPath(node.id)) nodes.set(node.id, true);
        else nodes.set(node.id, false);
      });

      graphData.current.edges.forEach((edge)=>{
        if(edgeInPath(edge.sourceId, edge.targetId)) edges.set(edge.id, true);
        else edges.set(edge.id, false);
      });

      setSimulationDataNodesPath(newPath)
      setSelectedNodesAndEdges({nodes: nodes, edges: edges});
      updateNodesAndEdgedClasses(nodes, edges);
    };

  return (
      <div className="ReactFlowWrapper">
        
        <ReactFlow
        nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesConnectable={false}
          fitView
        >
        <Background />
        </ReactFlow>
        
      </div>
  );
}

function NodeStatusIcon({ status }: { status: SimNodeComponentData["status"] }) {
  switch (status) {
    case "ACCEPT":
      return (
        <CheckIcon/>
      );
    case "REJECT":
      return (
       <XMarkIcon/>
      );
    case "HALT":
      return (
        <StopIcon></StopIcon>
      );
    case "LIMIT":
      return (
        <ExclamationCircleIcon></ExclamationCircleIcon>
      );
    default:
      return <Sitemap />;
  }
}

export function SimulationNodeComponent(props : NodeProps<RfNode>){
    const [detailsVisible , setDetailVisible] = useState<boolean>(false);
    
    function prepareDetails() : transitionData {
      const nodes = props.data.nodes;
      const currentNodeId = props.data.currentNode;
      const currentNode = nodes.get(currentNodeId)!;
      let out: transitionData = {transitions: new Map<number, string>(), isLeaf: false, output: "", onTransitionChosen: props.data.onTransitionChosen};

      const isLeaf = currentNode.nextIds.length === 0;
      out.isLeaf = isLeaf;

      if(isLeaf){
          if(currentNode.output == "REJECT"){
            out.output = "Rejected"
          }else if(currentNode.output == "ACCEPT"){
            out.output = "Accepted"
          }else if(currentNode.output == "HALT"){
            out.output = "No transition"
          }else if(currentNode.output == "LIMIT"){
            out.output = "Step limit exceeded"
          }

      }else{
        currentNode.nextIds.forEach((childId)=>{
          const childNodeStep = nodes.get(childId)!.step;
          let transition: string = "";
          transition += childNodeStep[0].stateBefore + ", ";

          childNodeStep.forEach((tape)=>{
            transition+=tape.readChar+", ";
          });
          transition+=" => ";

          transition += childNodeStep[0].stateAfter + ", ";

          childNodeStep.forEach((tape)=>{
            transition+=tape.writtenChar+", ";
          });

          childNodeStep.forEach((tape)=>{
            transition+=tape.transitionAction+", ";
          });
          out.transitions.set(childId, transition);
        });
      }

      return out;
    }

    return (
    <div
      className="SimulationNode"
      onClick={() => setDetailVisible(v => !v)}
    >
      <Handle type="source" className="simNodeHandle bottomHandle" position={Position.Bottom} />
      
      <NodeStatusIcon status={props.data.status} />

      {detailsVisible && (
        <SimulationNodeComponentDetails {...prepareDetails()} />
      )}

      <Handle className="simNodeHandle topHandle" type="target" position={Position.Top} />
    </div>
  );
}

//viewable data can be list of transitions or in case of leaf an output
export type transitionData = {
  onTransitionChosen: (id: number)=>void;
  transitions: Map<number, string>; //<id of node , viewable transition>
  isLeaf: boolean;
  output: string;
}
export function SimulationNodeComponentDetails( {transitions , isLeaf, output, onTransitionChosen}: transitionData ){

    return <div className={`SimulationNodeDetails ${isLeaf? "OutputDetails" : ""} `}>
        {
          isLeaf? <p className='SimulationNodeDetailsRowText TextOutput'>Output: {output}</p> :
          Array.from(transitions.entries()).map(([k,v])=>
            <div key={k} className='SimulationNodeDetailsRow' onClick={()=>{
             console.log("[compDet]: wybrano: ",{k}); onTransitionChosen(k);
            }}><p className="SimulationNodeDetailsRowText">{k}: {v}</p></div>
          )
        }
    </div>
}