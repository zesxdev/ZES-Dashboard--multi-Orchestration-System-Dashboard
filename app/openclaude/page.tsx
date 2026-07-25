"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Square, Server, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import AtomIcon from "@/components/icons/atom";

export default function OpenClaudePage() {
  const [status, setStatus] = useState("checking");
  const [serviceInfo, setServiceInfo] = useState(null);
  const [result, setResult] = useState("");

  const checkStatus = async () => {
    setStatus("checking");
    try {
      const res = await fetch(`http://localhost:5002/api/health/openclaude`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || "running");
        setServiceInfo(data);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("stopped");
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action) => {
    try {
      const res = await fetch(`http://localhost:5002/api/openclaude/${action}`, { method: "POST" });
      const data = await res.json();
      setResult(data.message || data.error || "Done");
      setTimeout(() => setResult(""), 3000);
      setTimeout(checkStatus, 2000);
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
  };

  const statusColor = status === "running" ? "success" : status === "stopped" ? "destructive" : "warning";

  return (
    <DashboardPageLayout header={{ title: "OpenClaude", description: "OpenClaude service manager", icon: AtomIcon }}>
      {/* Status Card */}
      <DashboardCard title="SERVICE STATUS" intent={status === "running" ? "success" : "default"}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center",
                "shadow-lg"
              )}>
                <FlaskConical className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-display">OpenClaude</h3>
                <p className="text-sm text-muted-foreground">AI agent bridge service</p>
              </div>
            </div>
            <Badge variant={status === "running" ? "default" : "secondary"} className={cn(
              "capitalize",
              status === "running" && "bg-success text-success-foreground"
            )}>
              {status === "running" ? "● Running" : status === "stopped" ? "○ Stopped" : "◌ Checking"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleAction("start")}
              disabled={status === "running"}
              variant="default"
              size="sm"
              className="gap-1"
            >
              <Play className="h-4 w-4" /> Start
            </Button>
            <Button
              onClick={() => handleAction("stop")}
              disabled={status !== "running"}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Square className="h-4 w-4" /> Stop
            </Button>
            <Button onClick={checkStatus} variant="ghost" size="sm">
              Refresh
            </Button>
          </div>

          {result && (
            <div className="bg-accent/20 rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground">
              {result}
            </div>
          )}

          {/* Info Grid */}
          {serviceInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(serviceInfo).filter(([k]) => k !== "status").map(([key, val]) => (
                <div key={key} className="bg-accent/20 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{key}</div>
                  <div className="text-xs font-mono font-bold truncate">{String(val)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Quick Actions */}
      <DashboardCard title="GRPC ENDPOINTS" intent="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { port: 50051, name: "gRPC Server", desc: "Primary RPC endpoint" },
            { port: 5300, name: "Bridge API", desc: "REST ↔ gRPC bridge" },
          ].map(ep => (
            <div key={ep.port} className="flex items-center justify-between bg-accent/20 rounded-lg p-3">
              <div>
                <div className="text-sm font-medium">{ep.name}</div>
                <div className="text-xs text-muted-foreground">{ep.desc}</div>
              </div>
              <Badge variant="outline" className="font-mono">:{ep.port}</Badge>
            </div>
          ))}
        </div>
      </DashboardCard>
    </DashboardPageLayout>
  );
}
