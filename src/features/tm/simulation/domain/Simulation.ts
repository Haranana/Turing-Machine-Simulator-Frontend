import type {
  SimulationNode,
  SimulationNodeMap,
  SimulationNodeRecord,
  SimulationStep,
  TapeState,
  TapeStateRecord,
  TapeSymbol,
} from "@simulation/types/simulationTypes";

function reviveTapeState(raw: TapeStateRecord): TapeState {
  return {
    head: raw.head,
    tape: new Map<number, TapeSymbol>(
      Object.entries(raw.tape).map(
        ([k, v]) => [Number(k), v as TapeSymbol] as [number, TapeSymbol]
      )
    ),
  };
}

export class NdSimulation{

    nodes: SimulationNodeMap; 
    path: number[]; //IDs of all nodes on chosen path, does include root
    branchings: number[]; //IDs of all branchings in simulation, useful for creating tree visual
    branchChoices: Map<number, number | null> //which branch was chosen for nodes with multiple next nodes, <id of branching node, id of chosen next node>
    
    constructor(newNodes: SimulationNodeRecord){
        this.path = [];
        this.branchings = [];
        this.branchChoices = new Map();

        this.nodes = new Map();

        Object.entries(newNodes).forEach(([k, nodeRecord]) => {
        const id = Number(k);

        const revivedSteps: SimulationStep[] = nodeRecord.steps.map(step => ({
            ...step,
            tapeBefore: reviveTapeState(step.tapeBefore),
        }));

        const simNode: SimulationNode = {
            ...nodeRecord,
            step: revivedSteps,
        };

        this.nodes.set(id, simNode);
        });

        this.nodes.forEach((v) => {
        if (v.nextIds.length > 1) {
            this.branchings.push(v.id);
            this.branchChoices.set(v.id, null);
        }
        });

        //this.updatePath();
    }

    //updates current path based on chosen branches;
    //assumes that if nodes map is non-empty then it has a root with an id of 0
    //also can just put chosen path straight to it i guess
    updatePath(){
        this.path = [];
        if(this.isEmpty()) return; 
        
        let currentNodeId: number = 0;
        while(true){
            const currentNode : SimulationNode | undefined = this.nodes.get(currentNodeId); 
            if(currentNode == undefined) return; //should never happen in theory but stays here as a safeguard

            
            this.path.push(currentNode.id);
            if(currentNode.nextIds.length === 1 ){ //normal node
                currentNodeId = currentNode.nextIds[0];
            }else if(currentNode.nextIds.length > 1){ //branching
                const chosenBranch : number | null | undefined = this.branchChoices.get(currentNode.id);

                if(chosenBranch != null){
                    currentNodeId = chosenBranch;
                }else{
                    break;
                }
            }else{ //leaf
                break
            }
        }
    }

    getStep(step: number, tapeId: number) : SimulationStep | null{
        //actual step id in path array, 1 is added because user should not access the root 
        //(which is stepless, so node 1 in path array actually stores step 0)
        const stepId = step + 1;

        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps[tapeId];
    }

    getStateBeforeForStep(step: number) : string | null{
        const stepId = step + 1;

        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const state : string | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.stateBefore; 
        return state == null? null : state;
    }

    getStateAfterForStep(step: number) : string | null{
        const stepId = step + 1;

        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const state : string | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.stateAfter; 
        return state == null? null : state;
    }



    getOutput(step: number) : string | null{
        const stepId = step + 1;

        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const out : string | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.output;
        return out;
    }
    
    getSteps(step : number): SimulationStep[] | null{
        const stepId = step + 1;
        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps;
    }

    getNextStep(step: number, tapeId: number) : SimulationStep | null{
        const stepId = step + 2;
        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps[tapeId];
    }

    getNextSteps(step: number) : SimulationStep[] | null{
        const stepId = step + 2;
        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps;
    }

    getPreviousStep(step: number, tapeId: number): SimulationStep | null{
        const stepId = step;
        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps[tapeId];
    }

    getPreviousSteps(step: number): SimulationStep[] | null{
        const stepId = step;
        if( !(stepId >=1 && stepId < this.path.length)) return null;

        const steps : SimulationStep[] | null = this.nodes.get(this.path[stepId])==null? null : this.nodes.get(this.path[stepId])!.step; 
        return steps == null? null : steps;
    }

    //assuming API deletes empty root
    isEmpty(): boolean{
        return this.nodes.size === 0;
    }

    //deos not include root!, in other words it's equal to amount of actual steps stored inside path
    pathLength(): number{
        return Math.max(this.path.length-1 , 0);
    }

    getLastStep(tapeId: number): SimulationStep | null {
        if(this.isEmpty()) return null;

        return this.nodes.get(this.path[this.pathLength()])!.step[tapeId];
    }

    getLastState() : string | null{
        if(this.isEmpty()) return null;

        return this.nodes.get(this.path[this.pathLength()])!.stateAfter;
    }


    isLeaf(step: number) : boolean{
        if(this.isEmpty()) return false;
        const stepId = step + 1;
        const curNode  = this.nodes.get(this.path[stepId])
        if(!curNode) return false;

        return curNode.nextIds.length===0? true : false;
    }


    /*old version:
    isLeaf(step: number) : boolean{
        if(this.isEmpty()) return false;
        const stepId = step;
        const curNode  = this.nodes.get(this.path[stepId])
        if(!curNode) return false;

        return curNode.nextIds.length===0? true : false;
    }*/

    getLastSteps(): SimulationStep[] | null {
        if(this.isEmpty()) return null;

        return this.nodes.get(this.path[this.pathLength()])!.step;
    }

    //includes root!
    length(): number{
        return this.nodes.size;
    }
    
}
