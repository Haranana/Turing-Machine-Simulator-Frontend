import "./tree.css"

import '@xyflow/react/dist/style.css';
import { Children, useCallback, useEffect, useState } from "react";
import { ReactFlow,Background,useNodesState,useEdgesState,type Node,type Edge, MiniMap, type NodeProps, type NodeTypes, Handle, Position
} from "@xyflow/react";
import { type SimulationNode , type SimulationNodeMap } from '../features/Tape/simulationTypes';
import ELK, { type ElkLayoutArguments, type LayoutOptions } from "elkjs/lib/elk.bundled.js";
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
};

export type RfNode = Node<SimNodeComponentData>;

export default function TreePage(){
const [nodes, setNodes, onNodesChange] = useNodesState<RfNode>([]);
const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
const {simulationData} = useSimulationData();
const [simulation, setSimulation] = useState<NdSimulation | null>(null);


  type GraphData = {
    children: {id: number}[]; 
    edges: {id: number, sourceId: number, targetId: number}[]
  }

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

  useEffect(() => {
    console.log("entering useEffect!");
    if(!simulationData) return;
    const newSimulation = new NdSimulation(simulationData)
    setSimulation(newSimulation);

    console.log("actually inside useEffect!");
    const graphData = simulationToGraphChildren(newSimulation);

    //map data (ideally got from zurand/props) to elk graph )
      const elkGraph = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "mrtree",
            "elk.direction": "DOWN",
            "elk.spacing.nodeNode": "100",
            "elk.layered.spacing.nodeNodeBetweenLayers": "80",
            "elk.layered.spacing.edgeEdgeBetweenLayers": "20",
        },
        children: graphData.children.map((n) => ({
            id: n.id.toString(),
            width: 100,
            height: 100,
        })),
        edges: graphData.edges.map((e) => ({
            id: e.id.toString(),
            sources: [e.sourceId.toString()],
            targets: [e.targetId.toString()],
        })),
      };

    //create layout and fill react flow page
    const getLayout = async () => {
      const res = await elk.layout(elkGraph);

      const elkNodes: RfNode[] =
        res.children?.map(node => ({
          id: node.id.toString(),
          type: "simNode",
          position: { x: node.x ?? 0, y: node.y ?? 0 },
          data: {
            nodes: newSimulation.nodes,
            currentNode: Number(node.id),
          },
          draggable: false,
        })) ?? [];

      const elkEdges: Edge[] = res.edges?.map((edge) => ({
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
        type: "straight",
      })) ?? [];

      setNodes(elkNodes);
      setEdges(elkEdges);

    }
    getLayout();

  }, [setNodes, setEdges, simulationData]);

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
    
    function prepareDetails() : string[] {
      const nodes = props.data.nodes;
      const currentNodeId = props.data.currentNode;
      const currentNode = nodes.get(currentNodeId)!;
      let out: string[] = [];

      
      const isLeaf = currentNode.nextIds.length === 0;

      if(isLeaf){
        if(currentNode.step[0].stateAfter == rejectState){
          out.push("Output: Reject")
        }else if(currentNode.step[0].stateAfter == acceptState){
          out.push("Output: Accept")
        }else{
          out.push("Output: Unknown")
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
          out.push(transition);
        });
      }
      return out;
    }

    return <div className="SimulationNode" onClick={()=>detailsVisible? setDetailVisible(false) : setDetailVisible(true)}>
      <Handle type="source" className="simNodeHandle bottomHandle" position={Position.Bottom} />
      {detailsVisible? <SimulationNodeComponentDetails viewableData={prepareDetails()} />: "" }
      <Handle className="simNodeHandle topHandle" type="target" position={Position.Top} />
    </div>
}

//viewable data can be list of transitions or in case of leaf an output
export function SimulationNodeComponentDetails({viewableData}: {viewableData: string[]} ){
    return <div className="SimulationNodeDetails">
        {viewableData.map((value,id)=><p className='SimulationNodeDetailsRow'>{id}: {value}</p>) 
        }
    </div>
}