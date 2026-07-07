import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
import {
  Plus,
  Search,
  Image as ImageIcon,
  FolderHeart,
  Pencil,
  Trash2,
  Pin,
  MoreVertical,
  AlertTriangle,
  MessageSquare, // 1. Added clean chat bubble icon for history
} from "lucide-react";
import { ConversationContext } from "../../context/ConversationContext";

interface SidebarComponentProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarComponentProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { conversationId: currentChatId } = useParams<{
    conversationId: string;
  }>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [convoIdToDelete, setConvoIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { conversations, fetchConversationsList } =
    useContext(ConversationContext);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeDeleteAction = async () => {
    if (!convoIdToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/api/conversation/${convoIdToDelete}`, {
        withCredentials: true,
      });
      fetchConversationsList();
      setIsDeleteModalOpen(false);
      setConvoIdToDelete(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-[#e3e3e3] font-sans p-0 select-none justify-between">
      <div className="space-y-6">
        {/* ➕ ACTION CONTROLS SECTION */}
        <div className="space-y-2">
          {/* New Chat Button */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center justify-center transition-all duration-150 text-[#00b660] group border border-slate-800/60 cursor-pointer bg-[#1a1a1c] hover:bg-[#202124] ${
              isCollapsed
                ? "w-10 h-10 rounded-full mx-auto"
                : "w-full px-4 py-2 rounded-full text-sm font-medium gap-3"
            }`}
            title="New Chat"
          >
            <Plus className="w-4 h-4 text-[#00b660] transition-transform group-hover:rotate-90" />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">New chat</span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={() => navigate("/dashboard/search")}
            className={`w-full flex items-center rounded-lg text-sm font-medium hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center py-2.5" : "px-4 py-2.5 gap-3"
            }`}
            title="Search chats"
          >
            <Search className="w-4 h-4" />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">
                Search chats
              </span>
            )}
          </button>

          {/* Images Button */}
          <button
            className={`w-full flex items-center rounded-lg text-sm font-medium hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center py-2.5" : "px-4 py-2.5 gap-3"
            }`}
            title="Images"
          >
            <ImageIcon className="w-4 h-4" />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">Images</span>
            )}
          </button>

          {/* Library Button */}
          <button
            className={`w-full flex items-center rounded-lg text-sm font-medium hover:bg-[#202124] hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center py-2.5" : "px-4 py-2.5 gap-3"
            }`}
            title="Library"
          >
            <FolderHeart className="w-4 h-4" />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">Library</span>
            )}
          </button>
        </div>

        {/* 📓 NOTEBOOKS SUB-SECTION */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold px-4 mb-2 tracking-wide uppercase text-slate-400 animate-in fade-in duration-200">
              Notebooks
            </h3>
          )}
          <button
            className={`w-full flex items-center rounded-lg text-sm font-medium hover:bg-[#202124] transition-colors ${
              isCollapsed ? "justify-center py-2" : "px-4 py-2 gap-3"
            }`}
            title="New notebook"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-200">
                New notebook
              </span>
            )}
          </button>
        </div>

        {/* RECENTS / CONVERSATION THREAD HISTORY LIST */}
        <div className="flex-1 flex flex-col min-h-0">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold px-4 mb-2 tracking-wide uppercase text-slate-400 animate-in fade-in duration-200">
              Recent
            </h3>
          )}

          <div className="space-y-1 overflow-y-auto max-h-[45vh] pr-1 custom-scrollbar">
            {conversations.map((convo) => {
              // 🟢 If the sidebar is collapsed, don't show recent history items at all
              if (isCollapsed) return null;

              const isActive = currentChatId === convo.conversationId;
              const isMenuOpen = activeMenuId === convo.conversationId;

              return (
                <div
                  key={convo.conversationId}
                  onClick={() => navigate(`/chat/${convo.conversationId}`)}
                  className={`
        group flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer 
        transition-all duration-150 ease-in-out text-sm
        ${isActive ? "bg-[#2c2d30] text-white font-medium" : "hover:bg-[#202124] hover:text-slate-200"}
      `}
                  title={convo.title || "Untitled Chat"}
                >
                  <div className="flex items-center gap-3 truncate w-full pr-2 animate-in fade-in duration-200">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate text-xs">
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
                      className={`p-1 rounded-md hover:bg-slate-700/50 transition-all duration-150 cursor-pointer ${
                        isMenuOpen
                          ? "opacity-100 text-slate-200"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-7 z-50 w-40 bg-[#1e1e20] border border-slate-800 rounded-xl shadow-xl py-1.5"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-[#2c2d30] hover:text-white transition-colors cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5" /> Pin thread
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-[#2c2d30] hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Rename title
                        </button>
                        <div className="border-t border-slate-800/80 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            setConvoIdToDelete(convo.conversationId);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete chat
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

      {/* Delete confirmation Modal portal wrapper code (unchanged) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#1e1e20] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-900/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Delete conversation?
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This action is permanent. All historical messages will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConvoIdToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#2c2d30]"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={executeDeleteAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
