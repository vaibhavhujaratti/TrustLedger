import React from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button, Badge } from "../components/ui/core";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Mocks representing data retrieved from an eventual useDashboard hook
  const activeProjects = 3;
  const inEscrow = 45000;
  const released = 12000;

  return (
    <div className="flex bg-surface min-h-screen">
      <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col hidden md:flex">
        <nav className="space-y-2">
          <Button variant="outline" className="w-full text-left">Overview</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">My Projects</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">Wallet</Button>
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
            <span className="text-3xl font-bold text-trust-green">₹{inEscrow}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Funds Released</span>
            <span className="text-3xl font-bold">₹{released}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Active Projects</span>
            <span className="text-3xl font-bold">{activeProjects}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Completed</span>
            <span className="text-3xl font-bold">2</span>
          </Card>
        </section>

        <section className="pt-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <Card className="divide-y p-0">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm">💰 Milestone 2 approved for "Web Redesign"</span>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm">✅ Milestone funds released ₹6,000</span>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
