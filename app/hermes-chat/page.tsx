"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";

export default function HermesChatPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Hermes Chat",
        description: "Memory & conversation hub — original terminal UI",
        icon: EmailIcon,
      }}
    >
      <div className="-mx-3 md:-mx-6 -mb-6 h-[calc(100vh-14rem)]">
        <iframe
          src="http://127.0.0.1:9119/chat"
          className="w-full h-full border-0 rounded-b-lg"
          title="Hermes Chat"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          style={{ background: "#0a0a0f" }}
        />
      </div>
    </DashboardPageLayout>
  );
}
