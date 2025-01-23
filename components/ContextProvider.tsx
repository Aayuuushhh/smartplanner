
"use client"

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig} from "@/msalConfig";
const msalInstance = new PublicClientApplication(msalConfig);
import { RecoilRoot } from "recoil";
import SidebarAbs from "./SidebarAbs";
export { SnackbarProvider as NotistackProvider } from 'notistack'



export default function ContextProvider({ children }: { children: React.ReactNode }){
    return (
        <MsalProvider instance={msalInstance}>
        <RecoilRoot>
                {children}
        </RecoilRoot>
        </MsalProvider>
    ) 
}