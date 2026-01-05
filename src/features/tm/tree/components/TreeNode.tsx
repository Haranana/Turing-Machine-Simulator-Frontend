import "@tree/styles/Tree.css"

import '@xyflow/react/dist/style.css';
import {useState } from "react";
import {type NodeProps, Handle, Position} from "@xyflow/react";
import { CheckIcon, ExclamationCircleIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { Sitemap } from '@sitemap/Sitemap';
import type { RfNode, SimNodeComponentData } from "@tree/types/TreeTypes";

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
          //transition += childNodeStep[0].stateBefore + ", ";
          transition += nodes.get(childId)!.stateBefore + " , ";
          childNodeStep.forEach((tape)=>{
            transition+=tape.readChar+", ";
          });
          transition+=" => ";

          //transition += childNodeStep[0].stateAfter + ", ";
          transition += nodes.get(childId)!.stateAfter + " , ";
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
              onTransitionChosen(k);
            }}><p className="SimulationNodeDetailsRowText">{k}: {v}</p></div>
          )
        }
    </div>
}