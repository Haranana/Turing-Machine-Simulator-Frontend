import { boolean, number } from 'zod';
import type {ReceiveSimulationDto, NdTmStepDto, NdTreeEdgeDto, NdTreeNodeDto, NdTmReturnDto, NdTreeNodeSchema} from '../../dtos/dto'
import type { SimulationNode, SimulationNodeMap, SimulationStep } from './simulationTypes';


export class NdSimulation{

    nodes: SimulationNodeMap; 
    path: number[]; //IDs of all nodes on chosen path, does include root
    branchings: number[]; //IDs of all branchings in simulation, useful for creating tree visual
    branchChoices: Map<number, number | null> //which branch was chosen for nodes with multiple next nodes, <id of branching node, id of chosen next node>
    
    constructor(newNodes: SimulationNodeMap){
       this.nodes = newNodes;

       this.path = [];

       this.branchings = [];
       this.branchChoices = new Map();
        this.nodes.forEach((v,_)=>{
            if(v.nextIds.length > 1){
                this.branchings.push(v.id);
                this.branchChoices.set(v.id , null);
            }
        })

        this.updatePath();
    }

    //updates current path based on chosen branches;
    //assumes that if nodes map is non-empty then it has a root with an id of 0
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

    //includes root!
    pathLength(): number{
        return this.path.length;
    }

    //includes root!
    length(): number{
        return this.nodes.size;
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