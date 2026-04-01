import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui/core";
import { useAuthStore } from "../stores/authStore";
import { useApproveMilestone, useReviewMilestone, useSubmitMilestone } from "../api/useMilestones";

// Mocks to represent the data
const dummyProject = {
  id: "test-id",
  title: "Website Redesign",
  status: "IN_PROGRESS",
  deadline: "2026-12-31",
  client: "Alice",
  freelancer: "Bob",
  escrow: { deposited: 20000, released: 5000 },
  milestones: [
    { id: "m1", title: "Design", amount: 5000, status: "FUNDS_RELEASED" },
    { id: "m2", title: "Frontend", amount: 10000, status: "SUBMITTED" },
    { id: "m3", title: "Backend", amount: 5000, status: "PENDING" },
  ]
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isClient = user?.role === "CLIENT";

  const { mutate: approve } = useApproveMilestone(id!);
  const { mutate: review } = useReviewMilestone(id!);
  const { mutate: submit } = useSubmitMilestone(id!);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-1 border-r border-border md:col-span-8 pr-6 space-y-6">
          <header className="space-y-2 mb-10">
            <div className="flex justify-between">
              <h1 className="text-4xl font-bold">{dummyProject.title}</h1>
              <Badge status={dummyProject.status} />
            </div>
            <p className="text-gray-500">Client: {dummyProject.client} • Freelancer: {dummyProject.freelancer}</p>
          </header>

          <h2 className="text-xl font-bold pb-2 border-b">Milestone Timeline</h2>
          <div className="space-y-4">
            {dummyProject.milestones.map((m) => (
              <Card key={m.id} className="flex flex-col md:flex-row items-center justify-between p-4">
                <div className="flex flex-col space-y-1">
                  <span className="font-bold flex items-center space-x-2">
                    <span>{m.title}</span> <Badge status={m.status}>{m.status}</Badge>
                  </span>
                  <span className="text-sm text-gray-500">₹{m.amount}</span>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {isClient && m.status === "SUBMITTED" && (
                    <>
                      <Button variant="danger" onClick={() => navigate(`/projects/${id}/dispute/${m.id}`)}>Review / Dispute</Button>
                      <Button variant="success" onClick={() => approve(m.id)}>Release ₹{m.amount}</Button>
                    </>
                  )}
                  {!isClient && m.status === "PENDING" && (
                    <Button variant="primary" onClick={() => submit({ milestoneId: m.id, url: "https://example.com" })}>Submit Deliverable</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          <Card className="bg-gray-50 border-gray-200">
            <h3 className="font-bold mb-4">Escrow Wallet</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Deposited</span>
                <span className="font-bold">₹{dummyProject.escrow.deposited}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Funds Released</span>
                <span className="font-bold text-trust-green">₹{dummyProject.escrow.released}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-trust-green h-2.5 rounded-full" style={{ width: `${(dummyProject.escrow.released / dummyProject.escrow.deposited) * 100}%` }}></div>
              </div>
            </div>
            {isClient && (
              <Button onClick={() => navigate(`/projects/${id}/invoice`)} variant="outline" className="w-full mt-6">Generate Invoice</Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
