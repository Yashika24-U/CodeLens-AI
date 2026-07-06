import React, { useState, useEffect } from "react";
import { Search, Mic } from "lucide-react"; // Custom icons matching your UI library

interface DashboardHome {
  username?: string;
}

export const DashboardHome: React.FC<DashboardHome> = ({
  username = "Yashika",
}) => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getDynamicGreeting = (): string => {
      const hour = new Date().getHours();

      // Night Owl Phase
      if (hour >= 22 || hour < 5) {
        const nightPhrases = [
          `Burning the midnight oil, ${username}? Let's solve some problems.`,
          `Late night session, ${username}? I'm up. What do you need?`,
        ];
        return nightPhrases[Math.floor(Math.random() * nightPhrases.length)];
      }
      // Morning Phase
      if (hour >= 5 && hour < 12) {
        return `Rise and shine, ${username}! What are we building today?`;
      }
      // Afternoon Phase
      if (hour >= 12 && hour < 17) {
        return `Good afternoon, ${username}. What's on your radar right now?`;
      }
      // Evening Phase
      return `Wrapping up the day, ${username}? How can I assist you right now?`;
    };

    setGreeting(getDynamicGreeting());
  }, [username]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0c10] text-[#f8fafc] px-4 select-none">
      {/* 🌟 Center Greeting Text */}
      <h1 className="text-4xl font-medium tracking-tight text-center mb-8 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
        {greeting}
      </h1>

      {/* 🔍 Search / Input Bar Container */}
      <div className="w-full max-w-2xl bg-[#141418] border border-white/10 rounded-full px-6 py-4 flex items-center gap-4 shadow-2xl focus-within:border-white/20 transition-all">
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Search size={22} />
        </button>

        <input
          type="text"
          placeholder="Ask anything..."
          className="bg-transparent flex-1 outline-none text-base text-slate-100 placeholder-slate-500 w-full"
        />

        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
};
export default DashboardHome;
