import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Image as ImageIcon,
  FolderHeart,
  Pencil,
  Trash2,
  Pin,
  MoreVertical,
} from "lucide-react";

interface Conversation {
  conversationId: string;
  title?: string;
}

interface SidebarProps {
  conversations: Conversation[];
}

export default function Sidebar({ conversations }: SidebarProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { conversationId: currentChatId } = useParams<{
    conversationId: string;
  }>();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col w-64  h-full text-[#e3e3e3] font-sans p-0 select-none justify-between border-r border-slate-800/40">
      <div className="space-y-6">
        {/* ➕ ACTION CONTROLS SECTION */}
        <div className="space-y-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium bg-[#1a1a1c] hover:bg-[#202124] transition-colors duration-150 text-indigo-400 group border border-slate-800/60 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400 transition-transform group-hover:rotate-90" />
            <span>New chat</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search chats</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>Images</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer">
            <FolderHeart className="w-4 h-4 text-slate-500" />
            <span>Library</span>
          </button>
        </div>

        {/* 📓 NOTEBOOKS SUB-SECTION */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 px-4 mb-2 tracking-wide uppercase">
            Notebooks
          </h3>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#202124] transition-colors">
            <Plus className="w-4 h-4 text-slate-500" />
            <span>New notebook</span>
          </button>
        </div>

        {/* RECENTS / CONVERSATION THREAD HISTORY LIST */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-xs font-semibold text-slate-500 px-4 mb-2 tracking-wide uppercase"></h3>
          <div className="space-y-0.5 overflow-y-auto max-h-[45vh] pr-1 custom-scrollbar">
            {conversations.map((convo) => {
              const isActive = currentChatId === convo.conversationId;
              const isMenuOpen = activeMenuId === convo.conversationId;

              return (
                <div
                  key={convo.conversationId}
                  onClick={() => navigate(`/chat/${convo.conversationId}`)}
                  className={`
                    group flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer 
                    transition-all duration-150 ease-in-out text-sm
                    ${
                      isActive
                        ? "bg-[#2c2d30] text-white font-medium"
                        : "text-slate-400 hover:bg-[#202124] hover:text-slate-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 truncate w-full pr-2">
                    <span className="truncate">
                      {convo.title || "Untitled Chat"}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          isMenuOpen ? null : convo.conversationId,
                        );
                      }}
                      className={`
                  p-1 rounded-md hover:bg-slate-700/50 transition-all duration-150 cursor-pointer
                   ${isMenuOpen ? "opacity-100 text-slate-200" : "opacity-0 group-hover:opacity-100 text-slate-400"}
                `}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-7 z-50 w-40 bg-[#1e1e20] border border-slate-800 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-100"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null); /* TODO: Trigger Pin Logic */
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-[#2c2d30] hover:text-white transition-colors"
                        >
                          <Pin className="w-3.5 h-3.5 text-slate-400" />
                          Pin thread
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              null,
                            ); /* TODO: Trigger Rename Logic */
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-[#2c2d30] hover:text-white transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          Rename title
                        </button>

                        <div className="border-t border-slate-800/80 my-1"></div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              null,
                            ); /* TODO: Trigger Delete Logic */
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
