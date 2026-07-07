import React, { useContext, useEffect } from "react";
import { ConversationContext } from "../../context/ConversationContext";

export const SearchPage = () => {
  const { conversations, fetchConversationsList } =
    useContext(ConversationContext);

  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  return (
    // 🎨 Main Background shifted to Soho Slate Dark Grey (#0b0c0c)
    <div className="min-h-screen w-full bg-[#0b0c0c] text-[#f3f4f6] px-6 py-12 font-sans selection:bg-[#00b660]/30">
      {/* 🔍 Soho Capsule Search Input Container */}
      <div className="max-w-[700px] mx-auto mb-10">
        <div className="flex items-center bg-[#1e2129] border border-[#2e333f] rounded-full px-6 py-3.5 focus-within:border-[#00b660] transition-all duration-200 shadow-lg">
          {/* Green-tinted Search Icon to match Soho branding */}
          <svg
            className="w-5 h-5 text-[#00b660] mr-3 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            className="bg-transparent border-none outline-none text-base w-full placeholder-gray-500 text-gray-200"
          />
        </div>
      </div>

      {/* 📂 Recent Activity Section */}
      <div className="max-w-[700px] mx-auto">
        {/* Subtitle using a clean muted gray-green style */}
        <h3 className="#f1f5f9 text-xs uppercase tracking-wider font-semibold mb-6 px-3">
          Recent Conversations
        </h3>

        <div className="flex flex-col gap-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 bg-[#1e2129] rounded-xl border border-[#2e333f]">
              <p className="#f1f5f9 text-sm">
                No recent workspaces or logs found.
              </p>
            </div>
          ) : (
            conversations.map((chat: any) => (
              <div
                key={chat.id || chat.conversationId}
                // Interactive hover styles shift slightly toward the Soho green signature accent tint
                className="flex justify-between items-center px-5 py-4 bg-[#1e2129]/60 border border-[#2e333f]/40 rounded-xl hover:bg-[#1e2129] hover:border-[#00b660]/40 cursor-pointer transition-all duration-200 group shadow-sm"
              >
                {/* Chat Title Layout */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Small decorative Soho indicator dot that highlights green on hover */}
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#00b660] transition-colors shrink-0" />
                  <span className="text-[15px] font-medium text-gray-200 group-hover:text-white truncate transition-colors">
                    {chat.title || "Untitled Chat"}
                  </span>
                </div>

                {/* Chat Timestamp/Date */}
                <span className="text-xs #f1f5f9 group-hover:text-gray-300 font-mono tracking-tight shrink-0 ml-4">
                  {chat.displayDate || "Today"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
