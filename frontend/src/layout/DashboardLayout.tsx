import { useState, useEffect } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/views/Sidebar";

export default function DashboardLayout() {
  const [conversations, setConversations] = useState<any[]>([]);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchConversationsList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/conversation/list`);
      setConversations(res.data.data);
    } catch (err) {
      console.error("Error fetching sidebar list:", err);
    }
  };

  useEffect(() => {
    fetchConversationsList();
    const handleSyncSignal = () => fetchConversationsList();
    window.addEventListener("newChatCreated", handleSyncSignal);

    return () => {
      window.removeEventListener("newChatCreated", handleSyncSignal);
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* PERSISTENT SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              LOGO
            </h3>
            <Sidebar
              conversations={conversations}
              setConversation={setConversations}
              refreshList={fetchConversationsList}
            />
          </div>
        </div>
        <div className="border-t border-slate-800 pt-4">
          <button className="w-full text-left py-2 px-3 rounded-md text-sm flex items-center gap-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
            📊 Open System Analytics
          </button>
        </div>
      </aside>

      {/* PERSISTENT MAIN FRAME */}
      <main className="flex-1 flex flex-col justify-between bg-slate-900">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">
              Dynamic Gateway Router Console
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational Free Tiers Synced
          </div>
        </header>

        {/* 🎯 THE MAGIC SLOT: Nested child views inject their JSX right here! */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
