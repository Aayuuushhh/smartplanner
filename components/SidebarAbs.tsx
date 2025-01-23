"use client"
import {
  Calendar,
  Search,
  Bell,
  Settings,
  AlertCircleIcon,
  LogOut,
} from "lucide-react";
import Sidebar, { SidebarItem } from "./sidebar";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { signOut  , getSession} from "next-auth/react";

import {
  useRecoilValue,
} from "recoil";

import { themeState } from "@/app/recoil/atom";
import { acquireToken, getOutlookCalendarEvents } from "@/utils/outlookapi";
import { useAccount, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";

// Import any loader/spinner component from a library, e.g., MUI, react-spinners, or your own CSS loader
import { CircularProgress } from "@mui/material"; // Example with MUI CircularProgress

const SidebarAbs = () => {

  const { instance: msalInstance, accounts } = useMsal();
  const account = useAccount(accounts[0] || null);
  const theme = useRecoilValue(themeState);
  const router = useRouter();

  return (
    <div className="flex">
      
      <Sidebar>
        <SidebarItem
          icon={
            <Calendar
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/dashboard");
              }}
            />
          }
          text="Calendar"
        />
        <SidebarItem
          icon={
            <Search
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/calendars");
              }}
            />
          }
          text="Search Calendar"
        />
        <SidebarItem
          icon={
            <Bell
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/alerts");
              }}
            />
          }
          text="Alerts"
        />
        <SidebarItem
          icon={
            <Settings
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/settings");
              }}
            />
          }
          text="Settings"
        />
        <SidebarItem
          icon={
            <AlertCircleIcon
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/alerts");
              }}
            />
          }
          text="Alerts"
        />
        <SidebarItem
          icon={
            <RiAdminLine
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={() => {
                router.push("/admin");
              }}
            />
          }
          text="Admin Page"
        />
        <SidebarItem
          icon={
            <LogOut
              size={30}
              color={theme === "light" ? "#282828" : "#EFECE4"}
              onClick={ async () => {
                try {
                  // Clear all localStorage keys
                  localStorage.clear();
            
                  // Logout Google user (if signed in via Google)
                  const session = await getSession();
                  if (session) {
                    await signOut({ callbackUrl: "/login" });
                  }
            
            
                  // Redirect to login page
                  router.push("/login");
                } catch (error) {
                  console.error("Error during logout:", error);
                }
              }}
            />
          }
          text="Logout"
        />
      </Sidebar>
    </div>
  );
};

export default SidebarAbs;
