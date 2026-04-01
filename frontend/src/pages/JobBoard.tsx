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
    <div className="max-w-4xl mx-auto py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">Browse open projects and apply to work on them.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-danger-700 bg-danger-50 rounded-xl border border-danger-100">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-5 bg-secondary-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/4"></div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12 lg:py-16">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No open projects right now</h3>
          <p className="text-sm text-gray-500">Check back later — clients post new projects regularly.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((p: any) => (
            <Card key={p.id} className="p-5 lg:p-6 border border-secondary-100 hover:border-secondary-200 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900">{p.title}</h2>
                        <Badge status={p.status} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-900">₹{Number(p.totalBudget).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">{new Date(p.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[10px] font-semibold">
                        {p.client?.displayName?.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{p.client?.displayName}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  disabled={isPending || appliedIds.has(p.id)}
                  onClick={() => handleApply(p.id)}
                  className="lg:self-start"
                >
                  {appliedIds.has(p.id) ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Applied
                    </>
                  ) : "Apply Now"}
                </Button>
              </div>

              {p.milestones?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Milestones ({p.milestones.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {p.milestones.map((m: any) => (
                      <span key={m.id} className="text-xs bg-secondary-50 text-secondary-700 px-3 py-1.5 rounded-lg border border-secondary-100">
                        {m.title}
                        <span className="ml-1.5 font-medium text-brand-600">₹{Number(m.amount).toLocaleString()}</span>
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
