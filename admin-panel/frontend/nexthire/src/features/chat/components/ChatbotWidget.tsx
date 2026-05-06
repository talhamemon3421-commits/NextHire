import React, { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, Bot, User } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "../api/chatApi";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      parts: [{ text: "Hi there! I'm your AI Assistant. I can help you answer questions, analyze applicants, or even create a new job posting. What can I do for you today?" }]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newHistory = [...messages, { role: "user" as const, parts: [{ text: input }] }];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendChatMessage(newHistory);
      setMessages(res.data.history);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newHistory,
        { role: "model", parts: [{ text: "Sorry, I encountered an error. Please try again." }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPart = (part: any, idx: number) => {
    if (part.text) {
      const formatted = part.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={idx} dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }} />;
    }
    if (part.functionCall) {
      return (
        <div key={idx} className="text-xs italic text-slate-500 bg-slate-100 p-2 rounded mt-1">
          <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
          Executing action: {part.functionCall.name}...
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="h-12 w-12 md:h-14 md:w-14 bg-amber-500 hover:bg-amber-600 transition-colors shadow-xl rounded-full flex items-center justify-center animate-bounce"
            style={{ animationIterationCount: 3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 top-[76px] md:inset-auto md:bottom-6 md:right-6 md:w-[380px] md:h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-50">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">NextHire AI Agent</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => {
              if (msg.role === "user" && msg.parts.some(p => p.functionResponse)) return null;

              const isUser = msg.role === "user";
              return (
                <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-blue-600 text-white" : "bg-amber-100 text-amber-600"}`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-sm ${
                    isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-slate-700 rounded-tl-sm border border-slate-200"
                  }`}>
                    {msg.parts.map((p, idx) => renderPart(p, idx))}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form 
              className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                type="text"
                placeholder="Ask me to create a job or fetch applicants..."
                className="flex-1 bg-transparent px-3 text-sm focus:outline-none text-slate-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors rounded-full flex items-center justify-center text-white shrink-0"
              >
                <Send className="w-3.5 h-3.5 -ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
