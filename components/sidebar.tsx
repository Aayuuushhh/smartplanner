"use client";
import { themeState } from "@/app/recoil/atom";
import { HandThumbUpIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import { ChevronFirst, ChevronLast, CircleX, CrossIcon, Menu, MoreVertical } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useRecoilValue } from "recoil";

interface SidebarContextType {
  expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ expanded: true });

export default function Sidebar({ children }: any) {
  const [expanded, setExpanded] = useState(false);
  const theme = useRecoilValue(themeState);

  return (
    <div className="flex">
      <aside className={`fixed h-full ${expanded ? 'w-64' : 'w-20'} transition-width duration-500`}>
        <nav
          className={
            theme === "light"
              ? "h-full flex flex-col bg-[#EFECE4] shadow-md text-black duration-500 ease-out"
              : "h-full flex flex-col bg-[#282828] text-[#EFECE4] shadow-md duration-500 ease-out"
          }
        >
          <div className="flex justify-between items-center">
            {expanded && <h2 className="mx-2 px-4 text-xl">Smartplanner</h2>}
            <div className="p-4 pb-2 flex justify-between items-center">
              <button
                onClick={() => setExpanded((curr) => !curr)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                {expanded ? <Menu size={30} /> : <Menu size={30} />}
              </button>
            </div>
          </div>
          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3">{children}</ul>
          </SidebarContext.Provider>
        </nav>
      </aside>
      <main className={`flex-1 ${expanded ? 'ml-64' : 'ml-20'} transition-margin duration-500`}>
        {/* Your main content */}
      </main>
    </div>
  );
}

interface SidebarItemProp {
  icon: JSX.Element;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, text, active, alert, onClick }: SidebarItemProp) {
  const { expanded } = useContext(SidebarContext);
  const theme = useRecoilValue(themeState);
  return (
    <li
      className={
        theme === "light"
          ? `relative flex items-center py-2 px-3 my-2 font-xl rounded-md cursor-pointer transition-colors group 
                ${
                  active
                    ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                    : "hover:bg-[#fffac2] text-gray-800"
                }`
          : `relative flex items-center py-2 px-3 my-2 font-xl rounded-md cursor-pointer transition-colors group 
                ${
                  active
                    ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                    : "hover:bg-[gray] text-gray-800"
                }`
      }
      onClick={onClick}
    >
      {icon}
      <span
        className={
          theme === "light"
            ? `text-black overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              }`
            : `text-[#EFECE4] overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              }`
        }
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-3 h-5 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        ></div>
      )}

      {!expanded && (
        <span
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </span>
      )}
    </li>
  );
}