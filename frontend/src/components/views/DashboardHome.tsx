import React, { useState, useEffect } from "react";
import { Search, ArrowUp } from "lucide-react";
import { useAuth } from "../../context/useAuth";

interface DashboardHomeProps {
  userName?: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({}) => {
  const [greeting, setGreeting] = useState("");
  const { user } = useAuth();
  const userName = user?.username;
  

  useEffect(() => {
    const getDynamicGreeting = (): string => {
      const hour = new Date().getHours();

      // Night Owl Phase (10 PM - 5 AM)
      if (hour >= 22 || hour < 5) {
        const nightPhrases = [
          `Late session, ${userName}?`,
          `Up late, ${userName}?`,
          `Midnight coding, ${userName}?`,
        ];
        return nightPhrases[Math.floor(Math.random() * nightPhrases.length)];
      }
      // Morning Phase (5 AM - 12 PM)
      if (hour >= 5 && hour < 12) {
        return `Good morning, ${userName}.`;
      }
      // Afternoon Phase (12 PM - 5 PM)
      if (hour >= 12 && hour < 17) {
        return `Welcome back, ${userName}.`;
      }
      // Evening Phase (5 PM - 10 PM)
      return `Good evening, ${userName}.`;
    };

    setGreeting(getDynamicGreeting());
  }, [userName]);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-[#0d142e] text-[#f8fafc] px-4 pt-[30vh]  select-none overflow-hidden">
      {/* 🔮 Cool Premium Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* 🌟 Short, Crisp Greeting Text */}
        <h1 className="text-3xl font-medium tracking-tight text-center mb-8 bg-gradient-to-b from-slate-50 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
          {greeting}
        </h1>

        {/* 🔍 Premium Input Bar Container */}
        <div className="w-full bg-[#141418]/90 backdrop-blur-md border border-white/10 rounded-full pl-6 pr-3 py-3 flex items-center gap-4 shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] focus-within:border-white/20 focus-within:shadow-[0_0_50px_-12px_rgba(255,255,255,0.02)] transition-all duration-300">
          <Search size={20} className="text-slate-500 shrink-0" />

          <input
            type="text"
            placeholder="Ask code reviewer anything..."
            className="bg-transparent flex-1 outline-none text-base text-slate-100 placeholder-slate-500 w-full font-normal"
          />

          {/* ⚡ Send Button (Replaced Mic) */}
          <button className="bg-slate-100 text-slate-900 hover:bg-white p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center shrink-0">
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
