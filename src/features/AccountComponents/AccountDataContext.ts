// src/context/AccountDataContext.ts
import { createContext } from "react";
export type AccountData = { id:number|null; email:string|null; status:string|null; createdAt:string|null };
export const AccountDataContext = createContext<AccountData | null>(null);