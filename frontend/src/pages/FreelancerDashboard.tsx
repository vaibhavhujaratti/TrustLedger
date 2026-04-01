import React from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button, Badge } from "../components/ui/core";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "../api/useProjects";

export default function FreelancerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useMyProjects();

  const totalReceived = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalReleased ?? 0), 0);
  const activeJobs = projects.filter(p => p.status === "ACTIVE" || p.status === "IN_PROGRESS" as any).length;
  const pendingActions = projects.reduce((sum, p) => {
    return sum + ((p.milestones ?? []).filter((m: any) => m.status === "PENDING").length);
  }, 0);

  return (
    <div className="flex bg-surface min-h-screen">
      <aside className="w-64 bg-white border-r px-4 py-6 flex-col hidden md:flex">
        <nav className="space-y-2">
          <Button variant="outline" className="w-full text-left">Overview</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">Jobs</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">Earnings</Button>
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hi, {user?.displayName}</h1>
            <p className="text-gray-500">Welcome to your Freelancer dashboard</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Total Received</span>
            <span className="text-3xl font-bold text-trust-green">₹{totalReceived.toLocaleString()}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Active Jobs</span>
            <span className="text-3xl font-bold">{activeJobs}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Action Required</span>
            <span className="text-3xl font-bold text-trust-amber">{pendingActions}</span>
          </Card>
        </section>

        <section className="pt-8">
          <h2 className="text-xl font-bold mb-4">My Jobs</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : projects.length === 0 ? (
            <Card className="text-center text-gray-400 py-10">No jobs assigned yet.</Card>
          ) : (
            <Card className="divide-y p-0">
              {projects.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-gray-400">Budget: ₹{Number(p.totalBudget).toLocaleString()}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              ))}
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
