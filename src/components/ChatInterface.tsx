import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, X, Loader2, User, Trash2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "stadiumiq" | "staff";
  text: string;
}

interface StaffMember {
  name: string;
  role: string;
  zone: string;
  status: string;
}

export function ChatInterface({ 
  role, 
  onClose, 
  staffMember 
}: { 
  role: string; 
  onClose: () => void; 
  staffMember?: StaffMember | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storageKey = staffMember 
    ? `stadiumiq_chat_staff_${staffMember.name}` 
    : `stadiumiq_chat_assistant_${role}`;

  // Initialize and load chat logs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing chat logs", e);
      }
    }

    if (staffMember) {
      setMessages([
        { 
          id: "1", 
          sender: "staff", 
          text: `Hi! This is ${staffMember.name} (${staffMember.role}) on duty at ${staffMember.zone}. Standing by for orders. Status: ${staffMember.status.toUpperCase()}.` 
        }
      ]);
    } else {
      setMessages([
        { 
          id: "1", 
          sender: "stadiumiq", 
          text: `Hello! I am your FIFA 2026 Smart Assistant for ${role} operations. How can I help you today?` 
        }
      ]);
    }
  }, [staffMember, role, storageKey]);

  // Save changes to localStorage
  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } else if (messages && messages.length === 0) {
      localStorage.removeItem(storageKey);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    if (staffMember) {
      // Human-to-Human Staff Dispatch Chat Simulation
      setTimeout(() => {
        let reply = "Copy that. Roger. Proceeding with orders.";
        const lowInput = userMessage.text.toLowerCase();
        
        if (staffMember.role.toLowerCase().includes("security")) {
          if (lowInput.includes("status") || lowInput.includes("check")) {
            reply = `Acknowledged. Sector is currently secure and quiet. I am keeping a close eye on the flow near ${staffMember.zone}.`;
          } else if (lowInput.includes("incident") || lowInput.includes("report") || lowInput.includes("alert")) {
            reply = `Copy that! Dispatch received. Heading over to the incident spot in ${staffMember.zone} immediately to secure the perimeter.`;
          } else {
            reply = `Roger that. Security team at ${staffMember.zone} is on it. I will report back shortly.`;
          }
        } else if (staffMember.role.toLowerCase().includes("medical")) {
          if (lowInput.includes("status") || lowInput.includes("check")) {
            reply = `We are set up and ready here. First aid station is fully functional. No active casualties right now.`;
          } else if (lowInput.includes("emergency") || lowInput.includes("help") || lowInput.includes("injury")) {
            reply = `Understood! Medical responders dispatched with life-support kit to the location in ${staffMember.zone}. ETA under 2 minutes.`;
          } else {
            reply = `Acknowledged. Medical team is standby and prepared.`;
          }
        } else if (staffMember.role.toLowerCase().includes("steward") || staffMember.role.toLowerCase().includes("volunteer")) {
          if (lowInput.includes("gate") || lowInput.includes("crowd") || lowInput.includes("flow")) {
            reply = `Yes, directing fans systematically now. Directing traffic to less crowded turnstiles as instructed.`;
          } else {
            reply = `Got it. Directing and helping fans at ${staffMember.zone}. Standing by for any other instructions.`;
          }
        } else if (staffMember.role.toLowerCase().includes("hospitality")) {
          reply = `Received. Premium guest lounge is operations-ready, catering and protocols are in order.`;
        } else {
          reply = `Acknowledged Admin. Standing by at ${staffMember.zone} with active status.`;
        }

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "staff", text: reply }]);
        setLoading(false);
      }, 800);
    } else {
      // StadiumIQ AI Chat Assistant Mode
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.text, persona: role, sessionId: "web_session" }),
        });
        const data = await response.json();
        
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "stadiumiq", text: data.answer }]);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "stadiumiq", text: "Sorry, I am having trouble connecting to the AI service." }]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999]">
      <div className={`p-4 text-white flex justify-between items-center ${staffMember ? "bg-cyan-600" : "bg-emerald-600"}`}>
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
            {staffMember ? (
              <>
                <User className="w-4 h-4"/> Direct Personnel
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4"/> Smart Assistant
              </>
            )}
          </h3>
          <button
            onClick={() => {
              if (window.confirm("Clear all messages in this chat?")) {
                setMessages([]);
                localStorage.removeItem(storageKey);
              }
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono text-white/70 hover:text-white hover:bg-black/20 rounded border border-white/20 transition-all font-black uppercase"
          >
            <Trash2 className="w-2.5 h-2.5" />
            Clear
          </button>
        </div>
        <button onClick={onClose} className="hover:text-zinc-200 transition-colors"><X className="w-4 h-4"/></button>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-black space-y-4">
        {messages.map(m => (
          <div 
            key={m.id} 
            className={`p-3 rounded-2xl max-w-[80%] ${
              m.sender === "user" 
                ? (staffMember ? "bg-cyan-600 text-white ml-auto" : "bg-emerald-600 text-white ml-auto") 
                : "bg-zinc-900 border border-zinc-800 text-zinc-100"
            }`}
          >
            {m.sender !== "user" && (
              <span className="block text-[8px] font-mono text-zinc-500 uppercase mb-1">
                {m.sender === "stadiumiq" ? "StadiumIQ AI" : staffMember?.name || "Staff"}
              </span>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="p-3 text-zinc-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin"/>
            <span className="text-[10px] font-mono uppercase text-zinc-500">
              {staffMember ? `${staffMember.name} is typing...` : "AI Thinking..."}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-zinc-800 flex gap-2 bg-black">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:outline-none text-xs"
          placeholder={staffMember ? `Text ${staffMember.name}...` : "Ask a question..."}
        />
        <button 
          onClick={handleSend} 
          className={`p-2 text-white rounded-xl ${staffMember ? "bg-cyan-600 hover:bg-cyan-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
        >
          <Send className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
}
