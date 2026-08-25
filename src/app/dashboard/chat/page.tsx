"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export default function ClientChatPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (pid: string) => {
    try {
      const res = await fetch(`/api/projects/${pid}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.authenticated) {
          setCurrentUserId(meData.user.userId);
        }

        const pRes = await fetch("/api/projects");
        const pData = await pRes.json();
        if (pData.success && pData.projects.length > 0) {
          const pid = pData.projects[0].id;
          setProjectId(pid);
          await loadMessages(pid);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(() => {
      loadMessages(projectId);
    }, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !body.trim()) return;

    setSending(true);
    const textToSend = body;
    setBody("");

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: textToSend }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", height: "72vh" }}>
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 400, color: "var(--ink)" }}>
          Direct Team Chat
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "2px" }}>
          Message your assigned developer directly. No scheduled phone tag required.
        </p>
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          background: "var(--card)",
          borderRadius: "18px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", margin: "auto", fontFamily: "var(--mono)" }}>
              Loading conversation…
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isMine = msg.sender.id === currentUserId;
              const isDev = msg.sender.role === "DEVELOPER" || msg.sender.role === "ADMIN";

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                    maxWidth: "78%",
                    alignSelf: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", padding: "0 4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                      {isMine ? "You" : msg.sender.name}
                    </span>
                    {!isMine && isDev && (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "9px",
                          textTransform: "uppercase",
                          background: "var(--accent)",
                          color: "#fff",
                          padding: "1px 5px",
                          borderRadius: "999px",
                        }}
                      >
                        Team
                      </span>
                    )}
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>

                  <div
                    style={{
                      background: isMine ? "var(--ink)" : "var(--accent-soft)",
                      color: isMine ? "var(--bg)" : "var(--ink)",
                      borderRadius: isMine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      border: isMine ? "none" : "1px solid rgba(117, 128, 31, 0.25)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", margin: "auto", color: "var(--muted)", maxWidth: "38ch" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Start a conversation with your engineering team. Ask questions, send updates, or share ideas.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: "14px 18px",
            borderTop: "1px solid var(--line)",
            background: "rgba(23, 21, 15, 0.02)",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Type a message to your team…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!projectId || sending}
            style={{
              flex: 1,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "999px",
              padding: "10px 18px",
              fontFamily: "var(--body)",
              fontSize: "14.5px",
              color: "var(--ink)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!body.trim() || sending}
            style={{ fontSize: "13px", padding: "10px 20px" }}
          >
            {sending ? "…" : "Send →"}
          </button>
        </form>
      </div>
    </div>
  );
}
