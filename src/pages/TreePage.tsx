import "./tree.css"

import '@xyflow/react/dist/style.css';
import {useEffect, useRef, useState } from "react";
import { ReactFlow,Background,useNodesState,useEdgesState,type Node,type Edge, type NodeProps, type NodeTypes, Handle, Position} from "@xyflow/react";
import { type SimulationNode , type SimulationNodeMap } from '../features/Tape/simulationTypes';
import ELK, {type ElkNode } from "elkjs/lib/elk.bundled.js";
import { useSimulationData } from '../features/GlobalData/simulationData';
import { useSpecialStates } from '../features/GlobalData/specialStates';
import { NdSimulation } from '../features/Tape/Simulation';

const elk  = new ELK();

const nodeTypes : NodeTypes = {
  simNode: SimulationNodeComponent,
};

export type SimNodeComponentData = {
  nodes: SimulationNodeMap,
  currentNode: number,
  onTransitionChosen: (id: number) => void,
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
  const {simulationData, setSimulationPath, simulationPath} = useSimulationData();
  const [simulation, setSimulation] = useState<NdSimulation | null>(null);
  const [selectedNodesAndEdges , setSelectedNodesAndEdges] = useState<SelectedNodesAndEdges>({nodes: new Map<number, boolean>() , edges: new Map<number, boolean>()})
  const graphData = useRef<GraphData>({children: [], edges: []});
  const [elkGraph, setElkGraph] = useState<ElkNode>();

  //call at start of the component (just after simulationData is loaded)
  //create simulation based on zustand data
  //convert simulation data to graphData, digestable by elk
  //create maps of which nodes and edges are in path
  //create elk layout of graph
  //based on the layout create react flow graph
  useEffect(() => {
    if(!simulationData) return;
    const newSimulation = new NdSimulation(simulationData)
    //console.log("current path: ", simulationPath);
    setSimulation(newSimulation);

    const startingGraphData = simulationToGraphChildren(newSimulation);
    console.log("init graphData: ", startingGraphData);
    //setGraphData(startingGraphData);
    graphData.current = startingGraphData;
    graphDataToSelectedNodesAndEdges(startingGraphData);

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
        res.children?.map(node => ({
          id: node.id.toString(),
          type: "simNode",
          position: { x: node.x ?? 0, y: node.y ?? 0 },
          data: {
            nodes: newSimulation.nodes,
            currentNode: Number(node.id),
            onTransitionChosen: onTransitionChosen,
          },
          draggable: false,
          className: isNodeSelected(Number(node.id))? "SelectedNode" : "",
        })) ?? [];

      const elkEdges: Edge[] = res.edges?.map((edge) => ({
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
        type: "straight",
        className: isEdgeSelected(Number(edge.id))? "SimulationEdge SelectedEdge" : "SimulationEdge",
      })) ?? [];

      setNodes(elkNodes);
      setEdges(elkEdges);

    }
    getLayout();

  }, [setNodes, setEdges, simulationData]);

  function updateNodesAndEdgedClasses(selectedNodes: Map<number, boolean> , selectedEdges: Map<number, boolean>){
    console.log("updateNodesAndEdgedClasses,  selectedNodes: ", selectedNodes, "\nselectedEdges: ", selectedEdges )
        setNodes(prev => prev.map(n => (
          { 
            ...n,
            className: selectedNodes.get(Number(n.id)) === true ? "SelectedNode" : "",
          })));

    setEdges(eds => eds.map(e => (
      {
        ...e,
        className: selectedEdges.get(Number(e.id)) === true? "SimulationEdge SelectedEdge": "SimulationEdge",
      })));  
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
  function graphDataToSelectedNodesAndEdges(currentGraphData: GraphData){
    let nodes = new Map<number, boolean>()
    let edges = new Map<number, boolean>()

    const nodeInPath = (id: number) => simulationPath.includes(id);

    const edgeInPath = (sourceId: number, targetId: number) => {
      const sIn = simulationPath.includes(sourceId);
      const tIn = simulationPath.includes(targetId);
      return sIn && tIn;
    };

    currentGraphData.children.forEach((node)=>{
      if(nodeInPath(node.id)) nodes.set(node.id, true);
      else nodes.set(node.id, false);
    });

    currentGraphData.edges.forEach((edge)=>{
       if(edgeInPath(edge.sourceId, edge.targetId)) edges.set(edge.id, true);
       else edges.set(edge.id, false);
    });

    setSelectedNodesAndEdges({nodes: nodes, edges: edges});
  }

  function isNodeSelected(nodeId: number) {
  return selectedNodesAndEdges.nodes.get(nodeId) === true;
}

  function isEdgeSelected(edgeId: number) {
    return selectedNodesAndEdges.edges.get(edgeId) === true;
  }

  //creates path based on chosen transition
    //any transition can be selected, so each time onTransitionChosen is called
    //path must be cleared and build from the root
    const onTransitionChosen = (nodesMapChildId: number) => {
      console.log("[otc]: chosen:", nodesMapChildId);

     
      if(simulationData==null){
        console.log("simulation is null lmao");
        return;
      }
       const simulation = new NdSimulation(simulationData);
      

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

      
      setSimulationPath(newPath)
      setSelectedNodesAndEdges({nodes: nodes, edges: edges});
      updateNodesAndEdgedClasses(nodes, edges);
      
    };

  

  return (
      <div style={{ width: "100%", height: "100%" }}>
        
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



export function SimulationNodeComponent(props : NodeProps<RfNode>){

    const [detailsVisible , setDetailVisible] = useState<boolean>(false);
    const {rejectState, acceptState} = useSpecialStates();
    
    function prepareDetails() : transitionData {
      const nodes = props.data.nodes;
      const currentNodeId = props.data.currentNode;
      const currentNode = nodes.get(currentNodeId)!;
      let out: transitionData = {transitions: new Map<number, string>(), isLeaf: false, output: "", onTransitionChosen: props.data.onTransitionChosen};

      const isLeaf = currentNode.nextIds.length === 0;
      out.isLeaf = isLeaf;

      if(isLeaf){
        if(currentNode.step[0].stateAfter == rejectState){
          out.output = "Rejected"
        }else if(currentNode.step[0].stateAfter == acceptState){
          out.output = "Accepted"
        }else{
          out.output = "Unknown"
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

    return <div className="SimulationNode" onClick={()=>detailsVisible? setDetailVisible(false) : setDetailVisible(true)}>
      <Handle type="source" className="simNodeHandle bottomHandle" position={Position.Bottom} />
      {detailsVisible? <SimulationNodeComponentDetails { ...prepareDetails() } />: "" }
      <Handle className="simNodeHandle topHandle" type="target" position={Position.Top} />
    </div>
}

//viewable data can be list of transitions or in case of leaf an output
export type transitionData = {
  onTransitionChosen: (id: number)=>void;
  transitions: Map<number, string>; //<id of node , viewable transition>
  isLeaf: boolean;
  output: string;
}
export function SimulationNodeComponentDetails( {transitions , isLeaf, output, onTransitionChosen}: transitionData ){

    return <div className="SimulationNodeDetails">
        {
          isLeaf? <p className='SimulationNodeDetailsRow'>Output: {output}</p> :
          Array.from(transitions.entries()).map(([k,v])=>
            <p key={k} className='SimulationNodeDetailsRow' onClick={()=>{
             console.log("[compDet]: wybrano: ",{k}); onTransitionChosen(k);
            }}>{k}: {v}</p>
          )
        }
    </div>
}