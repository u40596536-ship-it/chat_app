import React, { useState, useRef, useEffect } from "react";

function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm
        ${isUser ? "bg-black text-white rounded-br-sm" : "bg-white text-black border border-neutral-200 rounded-bl-sm"}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    const msg = input.trim();
    if (!msg || loading) return;

    setHistory((h) => [...h, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "⚠️ Error: " + (err.message || "unknown") }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Gemini Chat</h1>
          <a
            className="text-xs underline opacity-70 hover:opacity-100"
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
          >
            Powered by Vercel Functions
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4">
        <div
          ref={listRef}
          className="mt-5 mb-24 overflow-y-auto"
          style={{ maxHeight: "calc(100dvh - 180px)" }}
        >
          {history.length === 0 && (
            <div className="text-center text-neutral-500 mt-10">
              Start chatting with <span className="font-medium">Gemini</span> 👋
            </div>
          )}
          {history.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.content}
            </Bubble>
          ))}
          {loading && (
            <Bubble role="assistant">
              <span className="inline-flex items-center gap-2">
                <span className="animate-pulse">Thinking…</span>
              </span>
            </Bubble>
          )}
        </div>
      </main>

      <form
        onSubmit={sendMessage}
        className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white"
      >
        <div className="mx-auto max-w-3xl px-4 py-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-3 bg-black text-white font-medium disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
