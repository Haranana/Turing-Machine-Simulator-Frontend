export type TuringMachineGetDto = {
    id: number;
    authorId : number;

    name : string;
    description: string;
    program: string;

    initialState: string;
    acceptState: string;
    rejectState: string;

    blank: string;
    sep1: string;
    sep2: string;
    moveRight: string;
    moveLeft: string;
    moveStay: string;

    tapesAmount: number;

    createdAt: string;
    updatedAt: string;

    isVisible: boolean;
    shareCode: string;
}

type SortDir = "asc" | "desc";
type SortSpec = { property: string; direction?: SortDir };

export type PageableQuery = {
  page?: number;     
  size?: number;     //records per page
  sort?: SortSpec[]; //ex. [{ property: "createdAt", direction: "desc" }]
};

export type TuringMachineSaveDto = {

    name : string;
    description: string;
    program: string;

    initialState: string;
    acceptState: string;
    rejectState: string;

    blank: string;
    sep1: string;
    sep2: string;
    moveRight: string;
    moveLeft: string;
    moveStay: string;

    tapesAmount: number;
}

export type TuringMachineEditDto = {
    id: number;

    name : string | null ; 
    description: string | null;
    program: string | null;

    initialState: string | null;
    acceptState: string | null;
    rejectState: string | null;

    blank: string | null;
    sep1: string | null;
    sep2: string | null;
    moveRight: string | null;
    moveLeft: string | null;
    moveStay: string | null;

    tapesAmount: number | null;
}



export type Page<T> = {
  content: T[];
  number: number;        //current page (starting with 0)
  size: number;          //pages num
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type TmNameConfilctErrorBody = {
  name: string,
  id: number,
}