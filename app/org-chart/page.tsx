"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import AtomIcon from "@/components/icons/atom";
import BuildingIcon from "@/components/icons/building";
import OrgChart, { OrgNode } from "@/components/dashboard/org-chart";

function buildOrgTree(agents: any[]): OrgNode[] {
  const agentMap = new Map<string, any>();
  for (const a of agents) {
    agentMap.set(a.id, { ...a, children: [] });
  }
  const roots: OrgNode[] = [];
  for (const a of agents) {
    const node = agentMap.get(a.id)!;
    if (a.reportsTo && agentMap.has(a.reportsTo)) {
      agentMap.get(a.reportsTo)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function OrgChartContent() {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedAgent, setFocusedAgent] = useState(searchParams?.get("agent") || null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : data.agents || []);
      }
    } catch { console.warn("Could not fetch agents"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const tree = buildOrgTree(agents);

  return (
    <DashboardPageLayout
      header={{
        title: "Organization Chart",
        description: `${agents.length} agents · ${tree.length} top-level units`,
        icon: BuildingIcon,
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <CheckCircle2 className="size-3 mr-1 text-success" />
            {agents.filter((a) => a.status === "online" || a.status === "active").length} Online
          </Badge>
          <Badge variant="outline" className="text-xs">
            <AlertTriangle className="size-3 mr-1 text-warning" />
            {agents.filter((a) => a.status === "idle" || a.status === "busy").length} Busy
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {agents.filter((a) => a.status === "offline").length} Offline
          </Badge>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => { setFocusedAgent(null); fetchAgents(); }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs">Loading org chart...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <AtomIcon className="size-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No agents found</p>
            <p className="text-xs mt-1">Hire agents from the laboratory to build your organization.</p>
          </div>
        ) : (
          <OrgChart
            data={tree}
            focusedAgentId={focusedAgent}
            onAgentFocus={(id) => setFocusedAgent(id)}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}

export default function OrgChartPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <OrgChartContent />
    </Suspense>
  );
}
