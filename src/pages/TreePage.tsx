import '@xyflow/react/dist/style.css';
import { Children, useCallback, useEffect } from "react";
import { ReactFlow,Background,useNodesState,useEdgesState,type Node,type Edge, MiniMap, type NodeProps
} from "@xyflow/react";
import { type SimulationNode , type SimulationNodeMap } from '../features/Tape/simulationTypes';
import ELK, { type ElkLayoutArguments, type LayoutOptions } from "elkjs/lib/elk.bundled.js";
import { useSimulationData } from '../features/GlobalData/simulationData';

const elk  = new ELK();

const baseNodes = [
  { id: "1", label: "Root" },
  { id: "2", label: "Child A" },
  { id: "3", label: "Child B" },
];

const baseEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
];

const nodeTypes = {
  simNode: SimulationNodeComponent,
};

export type SimNodeComponentData = Node<{
  nodes: SimulationNodeMap,
  currentNode: number,
}>;

export default function TreePage(){
const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
const {simulation} = useSimulationData();

  type GraphData = {
    children: {id: number}[]; 
    edges: {id: number, sourceId: number, targetId: number}[]
  }

  function simulationToGraphChildren(): GraphData{
    let out: GraphData = {children: [], edges: []};
    if(!simulation) return out;

    //create node from each branching
    simulation.branchings.forEach((value,_)=>{
      const currentSimulationNode: SimulationNode = simulation.nodes.get(value)!;
      out.children.push({id: currentSimulationNode.id});

      //create edge beetwen this node and its children (or not if its leaf)
      currentSimulationNode.nextIds.forEach((childId: number)=>{
        const newEdgeId = out.edges.length;
        out.edges.push({id: newEdgeId, 
            sourceId:currentSimulationNode.id,
            targetId:childId,
        })
      });

    });
    return out;
  }

  useEffect(() => {
    if(!simulation) return;

    const graphData = simulationToGraphChildren();

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

      const elkNodes: Node[] =
        res.children?.map((node) => ({
          id: node.id,
          type: "simNode",
          position: { x: node.x ?? 0, y: node.y ?? 0 },
          data: {   
            nodes: simulation.nodes,
            currentNode: node.id,},
          draggable: false, 
        })) ?? [];

      const elkEdges: Edge[] = baseEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "straight",
      }));

      setNodes(elkNodes);
      setEdges(elkEdges);

    }
    getLayout();

  }, [setNodes, setEdges, simulation]);

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

export function SimulationNodeComponent(props : NodeProps<SimNodeComponentData>){

    function prepareDetails(){
      const nodes = props.data.nodes;

    }

    return <div className="SimulationNode">
      <p>node id: {props.data.currentNode}</p>
      <SimulationNodeComponentDetails transitions={[]} ></SimulationNodeComponentDetails>
    </div>
}

export function SimulationNodeComponentDetails({transitions}: {transitions: string[]} ){
    return <div className="SimulationNodeDetails">
        
    </div>
}