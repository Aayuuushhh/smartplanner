"use client";

import { usePathname } from "next/navigation";
import SidebarAbs from "@/components/SidebarAbs";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const noSidebarRoutes = ['/', '/login'];

  if (noSidebarRoutes.includes(pathname)) {
    return null;
  }

  return <SidebarAbs />;
}