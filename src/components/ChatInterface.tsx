import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, X, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "stadiumiq";
  text: string;
}

export function ChatInterface({ role, onClose }: { role: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "stadiumiq", text: `Hello! I am your FIFA 2026 Smart Assistant for ${role} operations. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Smart Assistant</h3>
        <button onClick={onClose}><X className="w-5 h-5"/></button>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`p-3 rounded-2xl max-w-[80%] ${m.sender === "user" ? "bg-emerald-600 text-white ml-auto" : "bg-white border border-slate-200"}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="p-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin"/></div>}
      </div>
      <div className="p-4 border-t border-slate-100 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border border-slate-200 rounded-xl"
          placeholder="Ask a question..."
        />
        <button onClick={handleSend} className="p-2 bg-emerald-600 text-white rounded-xl"><Send className="w-5 h-5"/></button>
      </div>
    </div>
  );
}
