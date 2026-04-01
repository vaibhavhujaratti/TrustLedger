import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui/core";
import { useAuthStore } from "../stores/authStore";
import { useApproveMilestone, useReviewMilestone, useSubmitMilestone } from "../api/useMilestones";
import { useProject } from "../api/useProjects";
import { useRaiseDispute } from "../api/useDisputes";
import { useDepositEscrow } from "../api/useEscrow";
import { useSignContract } from "../api/useProjects";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: project, isLoading, error } = useProject(id!);

  const isClient = user?.role === "CLIENT";

  const { mutate: approve } = useApproveMilestone(id!);
  const { mutate: review } = useReviewMilestone(id!);
  const { mutate: submit } = useSubmitMilestone(id!);
  const { mutateAsync: raiseDispute } = useRaiseDispute(id!);
  const depositEscrow = useDepositEscrow(id!);
  const signContract = useSignContract();

  if (isLoading) return <div className="flex justify-center py-20 text-gray-500">Loading project...</div>;
  if (error || !project) return <div className="flex justify-center py-20 text-red-500">Project not found.</div>;

  const deposited = Number(project.escrowWallet?.totalDeposited ?? 0);
  const released = Number(project.escrowWallet?.totalReleased ?? 0);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-1 border-r border-border md:col-span-8 pr-6 space-y-6">
          <header className="space-y-2 mb-10">
            <div className="flex justify-between">
              <h1 className="text-4xl font-bold">{project.title}</h1>
              <Badge status={project.status} />
            </div>
            <p className="text-gray-500">
              Client: {(project as any).client?.displayName} • Freelancer: {(project as any).freelancer?.displayName ?? "Not assigned"}
            </p>
          </header>

          <h2 className="text-xl font-bold pb-2 border-b">Milestone Timeline</h2>
          <div className="space-y-4">
            {(project.milestones ?? []).map((m) => (
              <Card key={m.id} className="flex flex-col md:flex-row items-center justify-between p-4">
                <div className="flex flex-col space-y-1">
                  <span className="font-bold flex items-center space-x-2">
                    <span>{m.title}</span> <Badge status={m.status}>{m.status}</Badge>
                  </span>
                  <span className="text-sm text-gray-500">₹{Number(m.amount).toLocaleString()}</span>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-2">
                  {isClient && m.status === "SUBMITTED" && (
                    <>
                      <Button
                        variant="danger"
                        onClick={async () => {
                          const reason =
                            window.prompt("Why are you raising a dispute? (min 10 chars)") ||
                            "Deliverable does not meet the agreed criteria.";
                          const dispute = await raiseDispute({ milestoneId: m.id, reason });
                          navigate(`/projects/${id}/dispute/${dispute.id}`);
                        }}
                      >
                        Dispute
                      </Button>
                      <Button variant="success" onClick={() => approve(m.id)}>Release ₹{Number(m.amount).toLocaleString()}</Button>
                    </>
                  )}
                  {isClient && m.status === "UNDER_REVIEW" && (
                    <Button variant="success" onClick={() => approve(m.id)}>Release ₹{Number(m.amount).toLocaleString()}</Button>
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
          {(project.status === "CONTRACT_REVIEW" || project.status === "AWAITING_DEPOSIT") && (
            <Card className="bg-white border-border">
              <h3 className="font-bold mb-2">Contract</h3>
              <p className="text-sm text-gray-600">
                Both parties must sign before escrow can be deposited.
              </p>
              <div className="mt-4 space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() =>
                    signContract.mutate(
                      { projectId: id!, ipHash: crypto.randomUUID().replace(/-/g, "") },
                      { onSuccess: () => {} }
                    )
                  }
                >
                  Sign Contract
                </Button>
              </div>
            </Card>
          )}

          <Card className="bg-gray-50 border-gray-200">
            <h3 className="font-bold mb-4">Escrow Wallet</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Deposited</span>
                <span className="font-bold">₹{deposited.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Funds Released</span>
                <span className="font-bold text-trust-green">₹{released.toLocaleString()}</span>
              </div>
              {deposited > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-trust-green h-2.5 rounded-full" style={{ width: `${(released / deposited) * 100}%` }}></div>
                </div>
              )}
            </div>
            {isClient && (
              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => depositEscrow.mutate(Number(project.totalBudget))}
                  variant="success"
                  className="w-full"
                  disabled={depositEscrow.isPending || project.status !== "AWAITING_DEPOSIT"}
                >
                  {depositEscrow.isPending ? "Depositing..." : `Deposit ₹${Number(project.totalBudget).toLocaleString()}`}
                </Button>
                <Button onClick={() => navigate(`/projects/${id}/invoice`)} variant="outline" className="w-full">
                  Invoice
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
