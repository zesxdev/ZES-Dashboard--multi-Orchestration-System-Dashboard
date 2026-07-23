"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import BracketsIcon from "@/components/icons/brackets";
import AtomIcon from "@/components/icons/atom";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
import LockIcon from "@/components/icons/lock";
import BoomIcon from "@/components/icons/boom";
import ZesIcon from "@/components/icons/zes-icon";
import BuildingIcon from "@/components/icons/building";

const navItems = [
  { title: "Overview", href: "/", icon: BracketsIcon, desc: "Home" },
  { title: "Lab", href: "/laboratory", icon: AtomIcon, desc: "Experiments" },
  { title: "Kanban", href: "/kanban", icon: BoomIcon, desc: "Tasks" },
  { title: "Companies", href: "/company", icon: BuildingIcon, desc: "Teams" },
  { title: "System", href: "/system", icon: ProcessorIcon, desc: "Resources" },
  { title: "Services", href: "/service", icon: CuteRobotIcon, desc: "Guard Bots" },
  { title: "Comm", href: "/communication", icon: EmailIcon, desc: "Messages" },
  { title: "H.Chat", href: "/hermes-chat", icon: ZesIcon, desc: "Hermes" },

  { title: "Router", href: "/9router", icon: BracketsIcon, desc: "9Router" },
  { title: "Topo", href: "/topology", icon: LockIcon, desc: "Topology" },
  { title: "C.Web", href: "/codex-web", icon: BracketsIcon, desc: "Codex" },
  { title: "O.Claude", href: "/openclaude", icon: AtomIcon, desc: "OpenClaude" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center h-16 px-2 overflow-x-auto gap-0.5 ">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0 px-2 py-1 rounded-lg transition-all min-w-0 shrink-0",
                "hover:bg-accent/30",
                "min-w-[3.2rem]",
                isActive
                  ? "text-sidebar-primary-foreground bg-sidebar-primary/5"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-md transition-all",
                isActive && "bg-sidebar-primary/10"
              )}>
                <Icon className={cn(
                  "size-4",
                  isActive && "drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]"
                )} />
              </div>
              <span className={cn(
                "text-[9px] font-medium leading-tight",
                isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground/60"
              )}>
                {item.title}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
