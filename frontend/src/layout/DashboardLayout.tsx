import { useEffect, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/views/Sidebar";
import { ConversationContext } from "../context/ConversationContext";

export default function DashboardLayout() {
  const { fetchConversationsList } = useContext(ConversationContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  return (
    // 🎨 Theme: Parent wrapper base changed to Soho Dark Slate (#0b0c0c)
    <div className="flex h-screen bg-[#0b0c0c] text-[#f3f4f6] font-sans overflow-hidden">
      <aside
        className={` border-[#2e333f]/60 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16 px-2" : "border-r w-64 px-4"
        }`}
      >
        <div className="space-y-4">
          <div>
            {/* ── Brand Logo Header Slot Inside Sidebar ── */}
            <div
              className={`flex items-center mb-6 select-none group py-6 ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <div className="flex items-center gap-3 h-14 px-4">
                {isCollapsed ? (
                  /* 🟢 COLLAPSED STATE: Swaps logo for toggle menu icon smoothly on hover */
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#202124] transition-colors duration-200 cursor-pointer"
                    title="Expand sidebar"
                  >
                    {/* Default State: Show the Sparkle / Brand Logo */}
                    <div className="block group-hover:hidden transition-all duration-200">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 fill-[#00b660]"
                        aria-hidden="true"
                      >
                        <path d="M12 2l2.4 7.2 7.2 2.4-7.2 2.4-2.4 7.2-2.4-7.2-7.2-2.4 7.2-2.4z" />
                      </svg>
                    </div>

                    {/* Hover State: Show the Expand Menu layout Asset */}
                    <div className="hidden group-hover:block text-slate-400 hover:text-slate-200 transition-all duration-200">
                      {/* Using a clean panel-right icon structure to mimic Gemini */}
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 stroke-current fill-none stroke-2"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  /* 🔵 EXPANDED STATE: Full Brand Title with standalone Collapse Button */
                  <div className="flex items-center justify-between w-full animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#00b660]/10 border border-[#00b660]/20 shadow-[0_0_15px_rgba(0,182,96,0.1)]">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5 fill-[#00b660] cursor-pointer"
                          aria-hidden="true"
                        >
                          <path d="M12 2l2.4 7.2 7.2 2.4-7.2 2.4-2.4 7.2-2.4-7.2-7.2-2.4 7.2-2.4z" />
                        </svg>
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="font-bold text-sm tracking-wide text-white cursor-pointer">
                          Nova AI
                        </span>
                        <span className="text-[10px] font-semibold text-[#00b660] tracking-wider uppercase opacity-80 mt-0.5">
                          CODE PARTNER
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-4 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#202124] transition-colors cursor-pointer"
                      title="Collapse sidebar"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 stroke-current fill-none stroke-2"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Sidebar isCollapsed={isCollapsed} />
          </div>
        </div>
        <div className="border-t border-[#2e333f]/60 py-4">
          <button
            className={`w-full text-left py-2 px-3 rounded-md text-sm flex items-center transition-all hover:bg-[#202124] hover:text-white cursor-pointer ${isCollapsed ? "justify-center" : "gap-2"}`}
          >
            <span>📊</span>
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">
                Open System Analytics
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* PERSISTENT MAIN FRAME */}
      <main className="flex-1 flex flex-col justify-between bg-[#0b0c0c]">
        <header className="flex items-center justify-between h-14 px-6 border-b border-slate-900/40 bg-[#0b0c0c]">
          {/* Left Side: Empty container or context title (e.g., Model picker could go here later) */}
          <div></div>

          {/* Right Side: Action Utilities & User Profile Icon */}
          <div className="flex items-center gap-4">
            {/* Profile Picture Trigger Button */}
            <button
              className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 hover:ring-2 hover:ring-[#00b660]/50 transition-all duration-200 cursor-pointer shadow-md"
              title="Account"
            >
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=Yashika" // Temporary clean avatar asset placeholder
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>
        {/* 🎯 THE MAGIC SLOT: Nested child views (DashboardHome, SearchPage, ChatWindow) inject their JSX right here! */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
