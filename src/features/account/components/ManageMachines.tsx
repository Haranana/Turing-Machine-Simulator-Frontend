import { useContext, useEffect, useState } from "react";
import {  ArrowLongDownIcon, ArrowLongUpIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-hot-toast';

import { AccountDataContext } from "@account/hooks/AccountDataContext";
import { useApiFetch } from "@api/apiUtils";
import {type TuringMachineGetDto, type PageableQuery , type Page} from "@account/types/AccountDataTypes";
import TuringMachineToLoad from "@account/components/TmView";
import { useTuringMachineData } from "@state/GlobalData";
import { API_BASE_URL } from "@api/apiUtils";

export default function LoadTuringMachine(){

    const accountData = useContext(AccountDataContext);
    const apiFetch = useApiFetch();
    const [sortByColumn, setSortByColumn] = useState<"name" | "description" | "createdAt" | "updatedAt">("name");
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");
    const [TuringMachinesData, setTuringMachinesData] = useState<Page<TuringMachineGetDto> | null>(null);
    const [listReloadNeeded, setListReloadNeeded] = useState<number>(0);
    const {setTmDataName} = useTuringMachineData();
    const [page, setPage] = useState<number>(0);
    const PAGE_SIZE = 20;   
    
    useEffect(() => {
    const buildTmList = async () => {
        try {
            const pq = buildPageQuery({
                page: page,
                size: PAGE_SIZE,
                sort: [{ property: sortByColumn, direction: sortType }]
            });

            const res = await apiFetch(`${API_BASE_URL}/api/tm?${pq}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (res.status === 200) {

                const pageData: Page<TuringMachineGetDto> = await res.json();
                setTuringMachinesData(pageData);
            } else {
                toast.error(`Turing Machine couldn't be loaded\n${res.status}`);
            }
        } catch (e: any) {
            toast.error(`Error: Turing Machine couldn't be loaded\n${e}`);
        }
    };

    buildTmList();
    }, [sortByColumn, sortType, listReloadNeeded, page]);

    function isAccountDataLoaded(){
        return accountData!=null&& accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null;
    }

    function handleDeleted() {
        setTmDataName(null);
        setListReloadNeeded(k => k + 1); 
    }

    function nextPage() {
    if (TuringMachinesData && !TuringMachinesData.last) {
        setPage(p => p + 1);
    }
    }

    function prevPage() {
        if (TuringMachinesData && !TuringMachinesData.first) {
            setPage(p => p - 1);
        }
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
        <>
        <div className="TmList">
            {
               TuringMachinesData.content.map( (tm, index) => <TuringMachineToLoad key={index} tm={tm} tmId={index} handleDeleted={handleDeleted} handleVisibilityChanged={()=>setListReloadNeeded((prev)=>(prev+1))}></TuringMachineToLoad>)
            }
        </div>
        
        <div className="ListFooter">

        <div className="LoadedMachinesCountWrapper">
            <p className="LoadedMachinesCountText">machines: {TuringMachinesData.totalElements}/100</p>
        </div>

        <div className="PageControls">
        <button className={`PageControlsButton ${TuringMachinesData.last? "Disabled" : ""} `}  disabled={TuringMachinesData.first} onClick={prevPage}> 
            {TuringMachinesData.first? <ChevronLeftIcon className="DisabledIcon"/>  : <ChevronLeftIcon/> }
             </button>

        <div className="PageControlsPages">
            {Array.from({ length: TuringMachinesData.totalPages }, (_, i) => {
                if (i < 3 || i === TuringMachinesData.totalPages - 1) {
                return (
                    <div
                    key={i}
                    className={`PageButton ${i === page ? "active" : ""}`}
                    onClick={() => setPage(i)}
                    >
                    {i + 1}
                    </div>
                );}

                if (i === 4) {
                    return (<div key="ellipsis">... </div> );
                }

                return null;
            })}
        </div>

        <button className={`PageControlsButton ${TuringMachinesData.last? "Disabled" : ""} `} disabled={TuringMachinesData.last} onClick={nextPage} >
            {TuringMachinesData.last? <ChevronRightIcon className="DisabledIcon" />: <ChevronRightIcon />}
        </button>

        </div></div></>
        : <div className="DataNotLoadedDiv">Error: Account data couldn't be loaded</div> 
        }

        {/* <button onClick={()=>{tmToDeleteNameRef.current = TuringMachinesData?.content.at(0)?.name?? "Turing machine";  setDeleteTmModalOpen(true);}}>
        Test Modal</button>*/}


    </div>
}