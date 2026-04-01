import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Input } from "../components/ui/core";
import { useAuthStore } from "../stores/authStore";
import { io, Socket } from "socket.io-client";
import { useDispute, useGenerateDisputeAiSummary, useResolveDispute } from "../api/useDisputes";

export default function DisputeChat() {
  const { projectId, id: disputeId } = useParams();
  const { user, token } = useAuthStore();
  const { data: dispute } = useDispute(disputeId || "");
  const aiSummary = useGenerateDisputeAiSummary(disputeId || "");
  const resolve = useResolveDispute(disputeId || "");

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dispute?.messages) {
      setMessages(
        dispute.messages.map((m: any) => ({
          sender: m.sender?.role ?? "USER",
          text: m.body,
        }))
      );
    }
  }, [dispute]);

  useEffect(() => {
    if (!disputeId) return;
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
      body: input,
    });
    setInput("");
  };

  return (
    <div className="h-[85vh] flex max-w-7xl mx-auto gap-4 py-4">
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="flex-1 bg-danger-50/50 border border-danger-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Dispute Raised</h2>
              <p className="text-xs text-gray-500">Project: {projectId?.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-secondary-100 space-y-3">
            <h3 className="font-semibold text-xs uppercase text-gray-400 tracking-wider">AI Summary</h3>
            {dispute?.aiSummary ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 leading-relaxed">{dispute.aiSummary.proposedResolution}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-lg font-medium">
                    Freelancer: {dispute.aiSummary?.suggestedSplit?.freelancer ?? dispute.proposedFreelancerPct ?? 50}%
                  </span>
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-lg font-medium">
                    Client: {dispute.aiSummary?.suggestedSplit?.client ?? dispute.proposedClientPct ?? 50}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                Chat to communicate, then generate an AI summary with a proposed resolution.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={aiSummary.isPending || !disputeId || (messages?.length ?? 0) < 2}
              onClick={() => aiSummary.mutate()}
            >
              {aiSummary.isPending ? "Generating..." : "Generate AI Summary"}
            </Button>

            <Button
              variant="success"
              size="sm"
              disabled={resolve.isPending || !dispute || !dispute.proposedFreelancerPct || !dispute.proposedClientPct}
              onClick={() =>
                resolve.mutate({
                  freelancerPct: dispute.proposedFreelancerPct ?? 50,
                  clientPct: dispute.proposedClientPct ?? 50,
                })
              }
            >
              {resolve.isPending ? "Resolving..." : "Accept Resolution"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="w-2/3 flex flex-col p-0 overflow-hidden border border-secondary-200">
        <div className="p-4 border-b border-secondary-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="font-semibold text-gray-900">Mediation Channel</span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-secondary-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "System" ? "justify-center" : m.sender === user?.role ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-3 rounded-2xl max-w-xs ${
                m.sender === "System" 
                  ? "bg-white text-xs text-center text-gray-500 border border-secondary-200" 
                  : m.sender === "CLIENT" 
                    ? "bg-brand-500 text-white rounded-br-md" 
                    : "bg-white text-gray-900 rounded-bl-md border border-secondary-200"
              }`}>
                {m.sender !== "System" && (
                  <div className={`text-[10px] font-bold mb-1 ${m.sender === user?.role ? "text-brand-200" : "text-brand-600"}`}>
                    {m.sender === "CLIENT" ? "Client" : "Freelancer"}
                  </div>
                )}
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-secondary-100 bg-white flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
            />
          </div>
          <Button onClick={handleSend} variant="primary" className="self-end">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  );
}
