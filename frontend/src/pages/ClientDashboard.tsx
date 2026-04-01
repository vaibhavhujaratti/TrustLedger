import React from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button, Badge } from "../components/ui/core";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "../api/useProjects";

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useMyProjects();

  const inEscrow = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalDeposited ?? 0), 0);
  const released = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalReleased ?? 0), 0);
  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const completed = projects.filter(p => p.status === "COMPLETED" as any).length;

  return (
    <div className="flex bg-surface min-h-screen">
      <aside className="w-64 bg-white border-r px-4 py-6 flex-col hidden md:flex">
        <nav className="space-y-2">
          <Button variant="outline" className="w-full text-left" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Overview</Button>
          <Button variant="outline" className="w-full text-left" onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}>My Projects</Button>
          <Button variant="outline" className="w-full text-left" onClick={() => navigate('/projects/new')}>+ New Project</Button>
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hi, {user?.displayName}</h1>
            <p className="text-gray-500">Welcome to your Client dashboard</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/projects/new')}>Create New Project</Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">In Escrow</span>
            <span className="text-3xl font-bold text-trust-green">₹{inEscrow.toLocaleString()}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Funds Released</span>
            <span className="text-3xl font-bold">₹{released.toLocaleString()}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Active Projects</span>
            <span className="text-3xl font-bold">{activeProjects}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Completed</span>
            <span className="text-3xl font-bold">{completed}</span>
          </Card>
        </section>

        <section id="projects-section" className="pt-8">
          <h2 className="text-xl font-bold mb-4">My Projects</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : projects.length === 0 ? (
            <Card className="text-center text-gray-400 py-10">No projects yet. Create your first one!</Card>
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
