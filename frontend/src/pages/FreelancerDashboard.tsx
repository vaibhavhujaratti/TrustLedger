import React from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button } from "../components/ui/core";

export default function FreelancerDashboard() {
  const { user } = useAuthStore();

  const balanceReceived = 34000;
  const pendingActions = 2;

  return (
    <div className="flex bg-surface min-h-screen">
      <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col hidden md:flex">
        <nav className="space-y-2">
          <Button variant="outline" className="w-full text-left">Overview</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">Jobs</Button>
          <Button variant="outline" className="w-full text-left bg-gray-50 border-transparent">Earnings</Button>
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hi, Freelancer {user?.displayName}</h1>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Total Received</span>
            <span className="text-3xl font-bold text-trust-green">₹{balanceReceived}</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Active Jobs</span>
            <span className="text-3xl font-bold">4</span>
          </Card>
          <Card className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Action Required</span>
            <span className="text-3xl font-bold text-trust-amber">{pendingActions}</span>
          </Card>
        </section>

        <section className="pt-8">
          <h2 className="text-xl font-bold mb-4">Earnings History</h2>
          <Card className="h-48 flex items-center justify-center text-gray-400">
            [ Earnings Chart Rendered Here ]
          </Card>
        </section>
      </main>
    </div>
  );
}
