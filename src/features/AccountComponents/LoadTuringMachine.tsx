import { useContext, useEffect, useState } from "react";
import { AccountDataContext } from "./AccountDataContext";
import {  ArrowLongDownIcon, ArrowLongUpIcon } from "@heroicons/react/24/solid";
import { useApiFetch } from "../../api/util";
import {type TuringMachineGetDto, type PageableQuery , type Page} from "./AccountDataTypes";
import TuringMachineToLoad from "./TuringMachineToLoad";


export default function LoadTuringMachine(){

    const accountData = useContext(AccountDataContext);
    const apiFetch = useApiFetch();
    const [simulationListLoaded, setSimulationListLoaded] = useState<boolean>(false); 
    const [sortByColumn, setSortByColumn] = useState<"name" | "description" | "createdAt" | "updatedAt">("name");
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");
    const [TuringMachinesData, setTuringMachinesData] = useState<Page<TuringMachineGetDto> | null>(null);
    const [listReloadNeeded, setListReloadNeeded] = useState<number>(0);

    useEffect(()=>{
        
        const buildTmList = async () => {
            try{
                const pq = buildPageQuery({page: 0, size: 10, sort: [{ property: sortByColumn, direction: sortType }]});
                const res = await apiFetch(`http://localhost:9090/api/tm?${pq}` , {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if(res.status == 200){
                    console.log("got machines: ", res.status);
                    const page: Page<TuringMachineGetDto> = await res.json();
                    setTuringMachinesData(page);
                    console.log(page);
                    //console.log("Machine program: ", page.content[0].program.split("\n"));
                    
                }else{
                    console.log("error while getting machine has occured: ", res.status);
                }
            }catch(e: any){
                console.log("exception while getting machine has occured: ", e);
            }
        }
        buildTmList();
    },[sortByColumn, sortType, listReloadNeeded] )


    function isAccountDataLoaded(){
        return accountData!=null&& accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null;
    }

    function handleDeleted() {
        setListReloadNeeded(k => k + 1); 
    }



    function buildPageQuery(p?: PageableQuery): string {
        const params = new URLSearchParams();
        if (!p) return params.toString();
        if (p.page !== undefined) params.set("page", String(p.page));
        if (p.size !== undefined) params.set("size", String(p.size));
        p.sort?.forEach(s => {
            const dir = s.direction ?? "asc";
            params.append("sort", `${s.property},${dir}`);
        });
        return params.toString();
    }

    function toggleSort(sortColumn: "name" | "description" | "createdAt" | "updatedAt"){
        if(sortColumn!=sortByColumn){
            setSortByColumn(sortColumn)
            setSortType("asc");
        }
        else{
           sortType == "asc"? setSortType("desc") : setSortType("asc");
        }
    }

    return <div className="AccountPageSubpage LoadTuringMachineSubpage">
        <div className="TmListDashboard">

            <div className="TmListButtonShowWrapper TmListEmptyWrapper"></div>
            <div className="TmListButtonNameWrapper TmListNonEmptyWrapper">
                <button className="TmListButtonName TmListButton" onClick={()=>toggleSort("name")}>
                    Name{sortByColumn=="name"? sortType=="asc"? <ArrowLongDownIcon className="TmListButtonIcon"/> : <ArrowLongUpIcon className="TmListButtonIcon"/> : ""}</button>
            </div>

            <div className="TmListButtonDescriptionWrapper TmListNonEmptyWrapper">
                <button className="TmListButtonDescription TmListButton" onClick={()=>toggleSort("description")}>
                    Description{sortByColumn=="description"? sortType=="asc"? <ArrowLongDownIcon className="TmListButtonIcon"/> : <ArrowLongUpIcon className="TmListButtonIcon"/> : ""}</button>
            </div>

            <div className="TmListButtonUpdatedAtWrapper TmListNonEmptyWrapper">
                <button className="TmListButtonUpdatedAt TmListButton" onClick={()=>toggleSort("updatedAt")}>
                    Last update{sortByColumn=="updatedAt"? sortType=="asc"? <ArrowLongDownIcon className="TmListButtonIcon"/> : <ArrowLongUpIcon className="TmListButtonIcon"/> : ""}</button>
            </div>
            <div className="TmListButtonLoadWrapper TmListEmptyWrapper"></div>
            <div className="TmListButtonDeleteWrapper TmListEmptyWrapper"></div>

        </div>
        {isAccountDataLoaded() && TuringMachinesData!=null?

        <div className="TmList">
            {
               TuringMachinesData.content.map(tm => <TuringMachineToLoad key={tm.id} tm={tm} handleDeleted={handleDeleted}></TuringMachineToLoad>)
            }
        </div>
        :
        "Account data not loaded :("
        }

    </div>
}