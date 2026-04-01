import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Input } from "../components/ui/core";
import { useAuthStore } from "../stores/authStore";

export default function DisputeChat() {
  const { projectId, id } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: "System", text: "Dispute opened for milestone M2." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: user?.role || "UNKNOWN", text: input }]);
    setInput("");
  };

  return (
    <div className="h-[85vh] flex max-w-7xl mx-auto gap-4 py-4">
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="flex-1 bg-red-50 border-red-200">
          <h2 className="font-bold text-trust-red mb-2 text-xl">Dispute Raised</h2>
          <p className="text-sm font-medium">Milestone: Frontend (M2)</p>
          <div className="mt-4 p-4 bg-white rounded border space-y-2">
            <h3 className="font-bold text-xs uppercase text-gray-400">AI Neutral Summary</h3>
            <p className="text-sm">The freelancer claims work is 100% complete according to specs. Client states the layout is broken on mobile devices.</p>
            <h3 className="font-bold text-xs uppercase text-gray-400 mt-2">Proposed Resolution</h3>
            <p className="text-sm font-bold text-trust-blue">Release 80% to freelancer, refund 20% to client for fixes.</p>
            <Button variant="outline" className="w-full mt-4 text-xs">Accept Proposed Split</Button>
          </div>
        </Card>
      </div>

      <Card className="w-2/3 flex flex-col p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold">Mediation Channel</div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "System" ? 'justify-center' : m.sender === user?.role ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-sm ${m.sender === 'System' ? 'bg-gray-100 text-xs text-center text-gray-500' : m.sender === 'CLIENT' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {m.sender !== 'System' && <div className="text-[10px] font-bold opacity-50 mb-1">{m.sender}</div>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2 bg-gray-50">
          <div className="flex-1"><Input placeholder="Type message..." value={input} onChange={(e: any) => setInput(e.target.value)} onKeyDown={(e: any) => e.key === 'Enter' && handleSend()} /></div>
          <Button onClick={handleSend} className="self-end mb-1">Send</Button>
        </div>
      </Card>
    </div>
  );
}
