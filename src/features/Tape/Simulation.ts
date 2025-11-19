import { boolean } from 'zod';
import type {ReceiveSimulationDto, NdTmStepDto, NdTreeEdgeDto, NdTreeNodeDto, NdTmReturnDto, NdTreeNodeSchema} from '../../dtos/dto'

export type transitionInfo = {
    stateBefore: string;
    read: string[];
    stateAfter: string;
    write: string[];
    actions: string[];
}

export type branchInfo = {
    edgeId: number;
    firstTransitionInfo: transitionInfo;
}

export type nodeInfo = {
    edges: branchInfo[];
    isLeaf: boolean
}

export class NdSimulation{
    
    nodeList: NdTreeNodeDto[];
    edgeList: NdTreeEdgeDto[];
    chosenBranches: Map<number, number | null>;
    //length: number;

    constructor(dto: NdTmReturnDto){
        this.nodeList = dto.nodeList;
        this.edgeList = dto.edgeList;

        this.chosenBranches = new Map();
        this.nodeList.forEach((v,k)=>{
             //if there's only one path from node (for example root in deterministic machine), its chosen automatically
            if(v.edgeIds.length === 1) this.chosenBranches.set(k, v.edgeIds[0]);
            else this.chosenBranches.set(k, null);
        });

        //length = this.length();
    }

    getNodeInfo(id: number) : nodeInfo{
        
        const nodeBranches = this.nodeList[id].edgeIds;
        const isLeaf : boolean = nodeBranches.length === 0? true : false
        
        let nodeBranchInfos: branchInfo[] = [];

        if(!isLeaf || nodeBranches.length == 0){    
            nodeBranches.forEach((branch)=>{
                let branchRead: string[] = [];
                let branchWrite: string[] = [];
                let branchActions: string[] = [];
                let branchStateBefore: string;
                let branchStateAfter: string;

                branchStateBefore = this.edgeList[branch].steps[0][0].stateBefore;
                branchStateAfter = this.edgeList[branch].steps[0][0].stateAfter;
                this.edgeList[branch].steps.forEach(tape=>{
                    branchRead.push(tape[0].readChar);
                    branchWrite.push(tape[0].writtenChar);
                    branchActions.push(tape[0].transitionAction);
                });

                const branchFirstTransitionInfo = {
                    stateBefore: branchStateBefore,
                    read: branchRead,
                    stateAfter: branchStateAfter,
                    write: branchWrite,
                    actions: branchActions,
                }
                const branchId = branch;

                nodeBranchInfos.push({
                    firstTransitionInfo: branchFirstTransitionInfo,
                    edgeId: branchId,
                });
            });
        }
        
        return {
            isLeaf: isLeaf,
            edges: nodeBranchInfos,
        }
    }

    useBranch(nodeId: number, branchId: number) : void{
        this.chosenBranches.set(nodeId, branchId);
    }

    //returns nextStep of given step and given tape on chosen branches or null
    nextStepOnBranch(stepId: number, tapeId: number) : NdTmStepDto | null{
        return this.getStep(stepId, tapeId);
    }

    //returns nextSteps on all tapes of given step
    nextStepsOnBranch(stepId: number) : NdTmStepDto[] | null{
        return this.getSteps(stepId+1);
    }

    //returns step of given stepId and given tapeId on chosen branches or null
    //stepId in this context refers to position of step on currently chosen branch
    getStep(stepId: number, tapeId: number) : NdTmStepDto | null{

        if(this.nodeList.length === 0) return null;
        let stepCounter = -1;
        let currentStepEdgeId : number;
        let currentNode : NdTreeNodeDto = this.nodeList[0] ;
        let currentEdge : NdTreeEdgeDto | null = null;
        let atEdge : boolean = false; 
        while(true){

            if(!atEdge){
                const nodeId = currentNode.id;
                if(currentNode.edgeIds.length == 0) return null;

                const chosenBranchId: number | null = this.chosenBranches.get(nodeId) ?? null;
                if(chosenBranchId == null) return null;

                currentEdge = this.edgeList[chosenBranchId]  
                stepCounter++;
                currentStepEdgeId = 0;              
            }else{
                if(currentEdge == null) return null;
                const isLastStepOnEdge = currentStepEdgeId = currentEdge.steps[tapeId].length-1;
                if(isLastStepOnEdge){
                    currentNode = this.nodeList[currentEdge.endNodeId];  
                }else{
                    if(stepId=== stepCounter){
                        return currentEdge.steps[tapeId][currentStepEdgeId];
                    }else{
                        currentStepEdgeId++;
                        stepCounter++;
                    }
                }
            }
        }
    }

    length() : number {
        if(this.nodeList.length === 0) return 0;
        let stepCounter = 0;
        let currentStepEdgeId : number;
        let currentNode : NdTreeNodeDto = this.nodeList[0] ;
        let currentEdge : NdTreeEdgeDto | null = null;
        let atEdge : boolean = false; 
        while(true){
            if(!atEdge){ //atNode
                const nodeId = currentNode.id;
                if(currentNode.edgeIds.length == 0) return Math.max(stepCounter, 0);

                const chosenBranchId: number | null = this.chosenBranches.get(nodeId) ?? null;
                if(chosenBranchId == null) return stepCounter;

                currentEdge = this.edgeList[chosenBranchId]  
                stepCounter++;
                currentStepEdgeId = 0;              
            }else{ //atEdge
                
                if(currentEdge == null) return stepCounter;
                const isLastStepOnEdge = currentStepEdgeId = currentEdge.steps[0].length-1;

                //entering Node
                if(isLastStepOnEdge){
                    currentNode = this.nodeList[currentEdge.endNodeId];  

                //Continuing on edge
                }else{  
                        currentStepEdgeId++;
                        stepCounter++;
                }
            }
        }
    }

    //checks whether given step is last step on the branch
    //in other words if step exists on branch and the node after him is leaf
    //if given step is the last step for which simulation can be made (next node is not leaf but its edge is not decided)
    //then given step is NOT the last
    isLastStep(step: number): boolean{
        if(this.isEmpty()) return false;

        let currentEdge = this.chosenBranches.get(this.nodeList[0].id);
        let stepCounter = 0;
        while(true){
            
            isLastInEdge: boolean;
            isEnding
        }
    }

    //Simulation is considerer empty if it has no node or its root do not have any edge
    isEmpty(): boolean{
        return this.nodeList.length === 0 || this.nodeList[0].edgeIds.length === 0;
    }
    

    //returns list of steps on all tapes with given id or null if not found/can't reach
    getSteps(stepId: number) : NdTmStepDto[] | null {
         if(this.nodeList.length === 0) return null;
        let stepCounter = -1;
        let currentStepEdgeId : number;
        let currentNode : NdTreeNodeDto = this.nodeList[0] ;
        let currentEdge : NdTreeEdgeDto | null = null;
        let atEdge : boolean = false; 
        while(true){

            if(!atEdge){
                const nodeId = currentNode.id;
                if(currentNode.edgeIds.length == 0) return null;

                const chosenBranchId: number | null = this.chosenBranches.get(nodeId) ?? null;
                if(chosenBranchId == null) return null;

                currentEdge = this.edgeList[chosenBranchId]  
                stepCounter++;
                currentStepEdgeId = 0;              
            }else{
                
                if(currentEdge == null) return null;
                const isLastStepOnEdge = currentStepEdgeId = currentEdge.steps[0].length-1;
                if(isLastStepOnEdge){
                    currentNode = this.nodeList[currentEdge.endNodeId];  

                }else{
                    if(stepId=== stepCounter){
                        let result: NdTmStepDto[] = []
                        for(let i = 0; i<currentEdge.steps.length; i++){
                            result.push(currentEdge.steps[i][currentStepEdgeId]);
                        }
                        return result;
                    }else{
                        currentStepEdgeId++;
                        stepCounter++;
                    }
                }
            }
        }

    }
}

/*
Alternatywa na strukture przetrzymujaca symulacje:

mapa node'ow: Map<num , node>

node wyglada nastepujaco
    Node{
        id: num
        nextId: num[] (wiele jesli jest to wierzcholek grafu, id - klucz w mapie)
        prevId: num | null (null jesli jest to pierwszy node, id - klucz w mapie)
        
        (lista wszystkich poprzednich rozgalezeni i potrzebnych wyborow,
         np [[2,3],[7,11],[16,31]] - czyli node'y 2,4,16 musza miec wybrane chosenNext i te chosenNext musza miec id kolejno: 3,11,31)
        previousBranchings[]: num[][] 

        chosenNext: num | null (null w przypadku braku rozgalezienia, num to id wybranego przez uzytkownika nextId jesli jest ich wiele)

        distanceFromStart: num (wygodne dla fronentdu do wyswietlania ktory to z kolei krok)
        step: SimulationStep[] (SimulationStep/NdTmStep dla kazdej z tasm, kazdy node powinien miec jako to pole tablice tego samego rozmiaru)
    }

zalety:
- latwy dostep do nastepnego i poprzedniego node'a
- latwe sprawdzanie czy droga z poprzednich node'ow zostala wybrana i dany krok moze zostac uzyty
- prostszy traverse po drzewie (nie trzeba oddzielnych warunkow dla node'ow i krawedzi, przechowywac id w krawedzi itp)
- (jesli sa jeszcze jakies to daj znac)???
wady:
- skok do konkretnego kroku jest liniowy, tak samo jak znalezienie wszystkich branchingow
- (jesli saj eszcze jakies to daj znac)???

Nastepnie w frontendzie, otrzymywany obiekt typu Map<num, Node> bylby opakowywany w klasie z metodami pomocniczymi

Simulation{
 nodes: Map<num , Node> (wziety z dto)
 branchings: num[] (id wszyskich branchingow dla optymalizacji, wyliczane w konstruktorze po otrzymaniu mapy)

 getStep(step) : SimulationStep | null
 getSteps(step, tapeId): SimulationStep[] | null
 getNextStep(step) : SimulationStep | null
 getPreviousStep(step): SimulationStep | null
 getNextSteps(step) : SimulationStep[] | null
 getPreviousSteps(step): SimulationStep[] | null
 isEmpty(): boolean
 length(): number
 useBranch(branchId, chosenPathId): boolean
 getBranchInfo(branchId): 
}
*/