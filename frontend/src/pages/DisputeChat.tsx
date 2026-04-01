import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Input } from "../components/ui/core";
import { useAuthStore } from "../stores/authStore";
import { io, Socket } from "socket.io-client";

export default function DisputeChat() {
  const { projectId, id: disputeId } = useParams();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "System", text: "Dispute channel opened. Both parties can communicate here." },
  ]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001", {
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit("join_dispute", disputeId);

    socket.on("receive_message", (msg: any) => {
      setMessages(prev => [...prev, { sender: msg.sender?.role ?? "USER", text: msg.body }]);
    });

    return () => { socket.disconnect(); };
  }, [disputeId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      disputeId,
      senderId: user?.id,
      body: input,
    });
    setMessages(prev => [...prev, { sender: user?.role ?? "USER", text: input }]);
    setInput("");
  };

  return (
    <div className="h-[85vh] flex max-w-7xl mx-auto gap-4 py-4">
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="flex-1 bg-red-50 border-red-200">
          <h2 className="font-bold text-trust-red mb-2 text-xl">Dispute Raised</h2>
          <p className="text-sm font-medium">Project ID: {projectId}</p>
          <div className="mt-4 p-4 bg-white rounded border space-y-2">
            <h3 className="font-bold text-xs uppercase text-gray-400">AI Neutral Summary</h3>
            <p className="text-sm text-gray-500">Use the chat to communicate. An AI summary can be generated once both parties have responded.</p>
          </div>
        </Card>
      </div>

      <Card className="w-2/3 flex flex-col p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold">Mediation Channel</div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "System" ? "justify-center" : m.sender === user?.role ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-sm ${m.sender === "System" ? "bg-gray-100 text-xs text-center text-gray-500" : m.sender === "CLIENT" ? "bg-blue-100" : "bg-green-100"}`}>
                {m.sender !== "System" && <div className="text-[10px] font-bold opacity-50 mb-1">{m.sender}</div>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t flex gap-2 bg-gray-50">
          <div className="flex-1">
            <Input
              placeholder="Type message..."
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
            />
          </div>
          <Button onClick={handleSend} className="self-end mb-1">Send</Button>
        </div>
      </Card>
    </div>
  );
}
