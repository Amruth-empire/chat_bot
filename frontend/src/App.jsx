import { useState } from "react";
import "./index.css";
import React from "react";

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    const updatedHistory = [...chatHistory, { role: "user", text: message }];
    setChatHistory(updatedHistory);
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        contents: updatedHistory.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        })),
        generationConfig: {
          temperature: 0.7,
          topP: 1,
          topK: 1,
          maxOutputTokens: 2048
        }
      };

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload })
      });

      const data = await res.json();
      setChatHistory([...updatedHistory, { role: "model", text: data.text }]);
    } catch (err) {
      console.error(err);
      setChatHistory([...updatedHistory, { role: "model", text: "Error fetching response" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg flex flex-col h-[80vh]">
        <header className="bg-slate-800 text-white p-4 rounded-t-lg">AI Assistant</header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-md ${
                  msg.role === "user" ? "bg-sky-600 text-white" : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm text-gray-500">Typing...</p>}
        </main>

        <form onSubmit={sendMessage} className="p-4 flex gap-2 border-t">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border p-2 rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            className="bg-sky-600 text-white px-4 rounded-lg hover:bg-sky-700"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
