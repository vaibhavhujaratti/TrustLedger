import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Badge } from "../components/ui/core";
import { useOpenProjects, useApplyToProject } from "../api/useProjects";

export default function JobBoard() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, refetch } = useOpenProjects();
  const { mutate: apply, isPending } = useApplyToProject();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleApply = (projectId: string) => {
    setError(null);
    apply(projectId, {
      onSuccess: () => {
        setAppliedIds((prev) => new Set(prev).add(projectId));
        navigate(`/projects/${projectId}`);
      },
      onError: (e: any) => setError(e?.response?.data?.error || "Failed to apply"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-gray-500 mt-1">Browse open projects and apply to work on them.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded">{error}</div>}

      {isLoading ? (
        <p className="text-gray-400">Loading open projects...</p>
      ) : projects.length === 0 ? (
        <Card className="text-center text-gray-400 py-16">
          <div className="text-4xl mb-4">📭</div>
          <p className="font-medium">No open projects right now.</p>
          <p className="text-sm mt-1">Check back later — clients post new projects regularly.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((p: any) => (
            <Card key={p.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{p.title}</h2>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500 pt-1">
                    <span>💰 Budget: <span className="font-semibold text-gray-800">₹{Number(p.totalBudget).toLocaleString()}</span></span>
                    <span>📅 Deadline: <span className="font-semibold text-gray-800">{new Date(p.deadline).toLocaleDateString()}</span></span>
                    <span>👤 Client: <span className="font-semibold text-gray-800">{p.client?.displayName}</span></span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  disabled={isPending || appliedIds.has(p.id)}
                  onClick={() => handleApply(p.id)}
                >
                  {appliedIds.has(p.id) ? "Applied ✓" : "Apply Now"}
                </Button>
              </div>

              {p.milestones?.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Milestones ({p.milestones.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {p.milestones.map((m: any) => (
                      <span key={m.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {m.title} — ₹{Number(m.amount).toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
