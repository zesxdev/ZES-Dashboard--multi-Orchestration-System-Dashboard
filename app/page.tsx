"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import DashboardCard from "@/components/dashboard/card";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import ActivityFeed from "@/components/dashboard/activity-feed";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BracketsIcon from "@/components/icons/brackets";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import { getHealth, getSystemInfo, getServices } from "@/lib/api-client";
import {
  Circle, Play, CheckCircle2, XCircle, Target, DollarSign,
} from "lucide-react";
import Link from "next/link";

const iconMap = { gear: GearIcon, proccesor: ProcessorIcon, boom: BoomIcon };

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const taskStatusIcon: Record<string, React.ElementType> = {
  pending: Circle, running: Play, done: CheckCircle2, completed: CheckCircle2, failed: XCircle,
};
const taskStatusColor: Record<string, string> = {
  pending: "text-muted-foreground", running: "text-primary", done: "text-success", completed: "text-success", failed: "text-destructive",
};

export default function DashboardOverview() {
  const router = useRouter();
  const isVercel = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_IS_VERCEL === 'true';

  useEffect(() => {
    if (isVercel) {
      router.replace('/service');
    }
  }, [isVercel, router]);

  if (isVercel) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading service dashboard...</p>
      </div>
    </div>;
  }

  const [stats, setStats] = useState<any[]>([]);
  const [rebels, setRebels] = useState<any[]>([]);
  const [security, setSecurity] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [taskSummary, setTaskSummary] = useState({ total: 0, pending: 0, running: 0, done: 0, failed: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [agentCount, setAgentCount] = useState(0);
  const [budgetData, setBudgetData] = useState<any>(null);

  const fetchData = async () => {
    const [health, system, services] = await Promise.all([
      getHealth(), getSystemInfo(), getServices(),
    ]).catch(() => [null, null, null]);

    if (health) {
      const s = health.map((svc: any, i: number) => ({
        id: svc.service || svc.name || `svc-${i}`,
        name: svc.service || svc.name || `Service ${i}`,
        description: svc.description || svc.state || "",
        status: svc.running ? "running" : "stopped",
        port: svc.port || null,
      }));
      setStats(s);
    }
    if (system) {
      setLastUpdated(`${system.hostname || "ZES"} · Load: ${system.load?.[0]?.toFixed(1) || "?"}`);
    }

    try {
      const tRes = await fetch("/api/tasks", { signal: AbortSignal.timeout(3000) });
      if (tRes.ok) {
        const tData = await tRes.json();
        setTaskSummary(tData.stats || { total: 0, pending: 0, running: 0, done: 0, failed: 0 });
        setRecentTasks((tData.tasks || []).slice(-5).reverse());
      }
    } catch {}

    try {
      const [cRes, trRes] = await Promise.all([
        fetch("/api/company", { signal: AbortSignal.timeout(3000) }),
        fetch("/api/company/tracker", { signal: AbortSignal.timeout(3000) }),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCompanyCount(cData.total || 0);
        let agents = 0;
        if (cData.primary) agents += cData.primary.agentCount || 0;
        if (cData.companies) agents += cData.companies.reduce((sum: number, c: any) => sum + (c.agentCount || 0), 0);
        setAgentCount(agents);
      }
      if (trRes.ok) {
        setBudgetData(await trRes.json());
      }
    } catch {}

    try {
      const [rebelsRes, secRes] = await Promise.all([
        fetch("/api/rebels", { signal: AbortSignal.timeout(3000) }),
        fetch("/api/security", { signal: AbortSignal.timeout(3000) }),
      ]);
      if (rebelsRes.ok) setRebels(await rebelsRes.json());
      if (secRes.ok) setSecurity(await secRes.json());
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, []);

  const onlineCount = stats.filter((s) => s.status === "running").length;

  return (
    <DashboardPageLayout
      header={{
        title: "Overview",
        description: lastUpdated || "The ultimate OS for rebels",
        icon: BracketsIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardStat
            label="Services Online"
            value={`${onlineCount}/${stats.length || "?"}`}
            description="System health status"
            icon={GearIcon}
            tag={onlineCount === stats.length && stats.length > 0 ? "ALL RUNNING" : "ISSUES"}
            intent={onlineCount === stats.length && stats.length > 0 ? "success" : "default"}
            direction="up"
          />
          <DashboardStat
            label="Companies"
            value={String(companyCount || 0)}
            description="Active companies"
            icon={BoomIcon}
            tag={`${agentCount || 0} AGENTS`}
            intent="default"
            direction="up"
          />
          <DashboardStat
            label="Tasks"
            value={String(taskSummary.total || 0)}
            description={`${taskSummary.pending || 0} pending · ${taskSummary.running || 0} active`}
            icon={ProcessorIcon}
            tag={taskSummary.failed > 0 ? `${taskSummary.failed} FAILED` : "ACTIVE"}
            intent={taskSummary.failed > 0 ? "default" : "success"}
            direction={taskSummary.failed > 0 ? "down" : "up"}
          />
        </div>

        {/* Task Summary + Budget + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Summary Card */}
          <DashboardCard title="TASK SUMMARY">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Circle className="size-3 text-muted-foreground" /> Pending
                </span>
                <span className="font-mono font-bold">{taskSummary.pending}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Play className="size-3 text-primary" /> Running
                </span>
                <span className="font-mono font-bold">{taskSummary.running}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-success" /> Done
                </span>
                <span className="font-mono font-bold">{taskSummary.done}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <XCircle className="size-3 text-destructive" /> Failed
                </span>
                <span className="font-mono font-bold">{taskSummary.failed}</span>
              </div>
            </div>
            {recentTasks.length > 0 && (
              <>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Recent</div>
                <div className="space-y-1">
                  {recentTasks.map((t: any) => {
                    const Icon = taskStatusIcon[t.status] || Circle;
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-[11px]">
                        <Icon className={cn("size-3 shrink-0", taskStatusColor[t.status] || "")} />
                        <span className="truncate text-muted-foreground">{t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </DashboardCard>

          {/* Budget Mini */}
          <DashboardCard title="BUDGET" addon={
            <Link href="/company">
              <Badge variant="outline" className="text-[9px] cursor-pointer hover:bg-accent">DETAILS &rarr;</Badge>
            </Link>
          }>
            {budgetData ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Daily Budget</span>
                    <span className="font-mono">{budgetData.day_tokens?.toLocaleString()} / {budgetData.day_budget?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all",
                      budgetData.day_percent >= 100 ? "bg-destructive" : budgetData.day_percent >= 80 ? "bg-warning" : "bg-success"
                    )} style={{ width: Math.min(budgetData.day_percent || 0, 100) + "%" }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{budgetData.day_percent}% used today</div>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Total all time: </span>
                  <span className="font-mono font-bold">{(budgetData.total_tokens || 0).toLocaleString()} tokens</span>
                </div>
                {budgetData.active_epic && (
                  <div className="text-[10px] text-primary flex items-center gap-1">
                    <Target className="size-3" /> Active: {budgetData.active_epic}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Budget data unavailable</p>
            )}
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard title="QUICK ACTIONS" frost="blue">
            <div className="space-y-2">
              <Link href="/laboratory">
                <div className="bg-accent/20 rounded-lg p-3 hover:bg-accent/40 transition-colors cursor-pointer">
                  <div className="text-xs font-medium">Hire Agent</div>
                  <div className="text-[10px] text-muted-foreground">Add new agents to your teams</div>
                </div>
              </Link>
              <Link href="/orchestrator">
                <div className="bg-accent/20 rounded-lg p-3 hover:bg-accent/40 transition-colors cursor-pointer">
                  <div className="text-xs font-medium">Dispatch Tasks</div>
                  <div className="text-[10px] text-muted-foreground">Create and assign tasks to agents</div>
                </div>
              </Link>
              <Link href="/company">
                <div className="bg-accent/20 rounded-lg p-3 hover:bg-accent/40 transition-colors cursor-pointer">
                  <div className="text-xs font-medium">Company Dashboard</div>
                  <div className="text-[10px] text-muted-foreground">View budget, org chart, and roster</div>
                </div>
              </Link>
            </div>
          </DashboardCard>
        </div>

        {/* Charts + Activity */}
        <DashboardChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RebelsRanking rebels={rebels} />
          <SecurityStatus statuses={security} />
        </div>

        <ActivityFeed />
      </div>
    </DashboardPageLayout>
  );
}
