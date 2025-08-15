import { useState } from "react";
import "./index.css";
import { FiSend } from "react-icons/fi";
import { BsChatDotsFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import React from "react";

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    const updatedHistory = [...chatHistory, { role: "user", text: message }];
    setChatHistory(updatedHistory);
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        contents: updatedHistory.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        })),
        generationConfig: {
          temperature: 0.7,
          topP: 1,
          topK: 1,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch("https://chat-bot-backend-02ex.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      const data = await res.json();
      setChatHistory([...updatedHistory, { role: "model", text: data.text }]);
    } catch (err) {
      console.error(err);
      setChatHistory([
        ...updatedHistory,
        { role: "model", text: "Error fetching response" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-700 transition-all duration-300 animate-bounce"
        >
          <BsChatDotsFill size={28} />
        </button>
      )}

      {/* Chatbox Panel */}
      <div
        className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ${
          open ? "h-[70vh] opacity-100" : "h-0 opacity-0 pointer-events-none"
        }`}
        style={{ transform: open ? "translateY(0)" : "translateY(20px)" }}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-sky-600 to-sky-500 text-white p-4 flex justify-between items-center">
          <span className="font-semibold tracking-wide">AI Assistant</span>
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-white/20 rounded-full p-1 transition"
          >
            <IoClose size={24} />
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-xl max-w-[75%] shadow-md text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-sky-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-gray-500 text-sm animate-pulse">Typing...</p>
          )}
        </main>

        {/* Input Area */}
        <form
          onSubmit={sendMessage}
          className="p-3 border-t flex items-center gap-2 bg-white"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-700 transition"
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </>
  );
}
