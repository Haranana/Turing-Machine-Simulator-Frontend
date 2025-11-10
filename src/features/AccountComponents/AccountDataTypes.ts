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

    tapesAmount: number;

    createdAt: string;
    updatedAt: string;
}

type SortDir = "asc" | "desc";
type SortSpec = { property: string; direction?: SortDir };

export type PageableQuery = {
  page?: number;     
  size?: number;     //records per page
  sort?: SortSpec[]; //ex. [{ property: "createdAt", direction: "desc" }]
};

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