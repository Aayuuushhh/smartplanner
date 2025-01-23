import type { Metadata } from "next";
import {  Rubik } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ContextProvider from "@/components/ContextProvider";
import SidebarAbs from "@/components/SidebarAbs";
import { NotistackProvider } from "@/components/ContextProvider";
const rubik = Rubik({ subsets: ["latin"] });
import SidebarWrapper from "@/components/SidebarWrapper";

export const metadata: Metadata = {
  title: "Smart Planner",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID!}>
    <ContextProvider>
    <html lang="en">  
    <body className={rubik.className}>
            <div className="flex">
              <SidebarWrapper/>
              <div className="flex-grow">
                <NotistackProvider>
                {children}
                <div id="portal-root"></div> {/* Add the portal root here */}
                </NotistackProvider>
              </div>
            </div>
          </body>
    </html>
    </ContextProvider>
    </GoogleOAuthProvider>
  );
}
