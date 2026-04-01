import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button, Badge } from "../components/ui/core";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "../api/useProjects";

interface FreelancerDashboardProps {
  onMenuToggle?: () => void;
}

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    id: "jobs",
    label: "My Jobs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "browse",
    label: "Browse Jobs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    highlight: true,
  },
];

const statCards = [
  {
    label: "Received",
    value: 0,
    prefix: "₹",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    label: "Active Jobs",
    value: 0,
    prefix: "",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    label: "Action Needed",
    value: 0,
    prefix: "",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    label: "Pending",
    value: 0,
    prefix: "₹",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
];

export default function FreelancerDashboard({ onMenuToggle }: FreelancerDashboardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useMyProjects();

  const [activeNav, setActiveNav] = useState("overview");

  const totalReceived = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalReleased ?? 0), 0);
  const activeJobs = projects.filter(p => p.status === "ACTIVE").length;
  const pendingActions = projects.reduce((sum, p) => {
    return sum + ((p.milestones ?? []).filter((m: any) => m.status === "PENDING").length);
  }, 0);
  const pendingPayouts = projects.reduce((sum, p) => {
    return sum + ((p.milestones ?? []).filter((m: any) => m.status === "APPROVED" || m.status === "SUBMITTED").length);
  }, 0);

  const stats = [
    { ...statCards[0], value: totalReceived },
    { ...statCards[1], value: activeJobs },
    { ...statCards[2], value: pendingActions },
    { ...statCards[3], value: pendingPayouts },
  ];

  return (
    <div className="flex min-h-screen bg-secondary-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-secondary-200 flex-col fixed h-full z-40">
        <div className="h-16 flex items-center px-6 border-b border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-text-primary"> Trust-Bound</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "browse") navigate("/job-board");
                else setActiveNav(item.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeNav === item.id && item.id !== "browse"
                  ? "bg-gray-900 text-white"
                  : item.highlight
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "text-secondary-600 hover:bg-secondary-100 hover:text-text-primary"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.displayName}</p>
              <p className="text-xs text-text-tertiary truncate">Freelancer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 lg:top-0 z-30">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-base lg:text-lg font-semibold text-text-primary">Dashboard</h1>
            <p className="hidden sm:block text-xs lg:text-sm text-text-tertiary">Welcome back, {user?.displayName}</p>
          </div>

          <Button 
            variant="primary" 
            onClick={() => navigate('/job-board')} 
            size="sm"
            className="shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Browse Jobs</span>
          </Button>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300">
                <div className={`absolute top-0 left-0 right-0 h-0.5 lg:h-1 bg-gradient-to-r ${stat.gradient}`} />
                
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm font-medium text-text-tertiary truncate">{stat.label}</p>
                    <p className="text-lg lg:text-2xl font-bold text-text-primary mt-1">
                      {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl ${stat.bg} flex items-center justify-center ${stat.text} flex-shrink-0`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-text-primary">My Jobs</h2>
                <p className="hidden sm:block text-xs lg:text-sm text-text-tertiary mt-0.5">Track your active projects</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="p-4 lg:p-6 animate-pulse">
                    <div className="h-5 bg-secondary-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card className="text-center py-10 lg:py-16">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-text-primary mb-2">No jobs assigned yet</h3>
                <p className="text-xs lg:text-sm text-text-secondary mb-6 max-w-xs mx-auto">
                  Browse available jobs and start earning with secure escrow protection.
                </p>
                <Button variant="primary" onClick={() => navigate('/job-board')}>
                  Browse Available Jobs
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {projects.map((p) => {
                  const released = Number((p as any).escrowWallet?.totalReleased ?? 0);
                  const pendingMilestones = (p.milestones ?? []).filter((m: any) => m.status === "PENDING").length;
                  const completedMilestones = (p.milestones ?? []).filter((m: any) => m.status === "APPROVED" || m.status === "FUNDS_RELEASED").length;
                  const totalMilestones = (p.milestones ?? []).length;
                  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                  return (
                    <Card 
                      key={p.id} 
                      className="p-4 lg:p-6 cursor-pointer group border border-secondary-100"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-text-primary group-hover:text-brand-600 transition-colors line-clamp-1 flex-1">
                          {p.title}
                        </h3>
                        <Badge status={p.status} size="sm" />
                      </div>
                      
                      <div className="space-y-2.5 lg:space-y-3">
                        <div className="flex items-center justify-between text-xs lg:text-sm">
                          <span className="text-text-tertiary">Total Value</span>
                          <span className="font-medium text-text-primary">₹{Number(p.totalBudget).toLocaleString()}</span>
                        </div>
                        
                        {released > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-tertiary">Earned</span>
                              <span className="text-brand-600 font-medium">₹{released.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-secondary-100 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-brand-400 to-brand-600 h-1 rounded-full transition-all duration-500" 
                                style={{ width: `${(released / p.totalBudget) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-secondary-100">
                          <span className="text-text-tertiary">
                            {pendingMilestones > 0 ? (
                              <span className="text-warning-600">{pendingMilestones} pending</span>
                            ) : (
                              <span className="text-text-tertiary">All delivered</span>
                            )}
                          </span>
                          <span className="text-text-tertiary">
                            {completedMilestones}/{totalMilestones} milestones
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Earnings Section */}
          {totalReceived > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-text-primary">Earnings</h2>
                  <p className="hidden sm:block text-xs lg:text-sm text-text-tertiary mt-0.5">Payment history</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {projects.filter(p => (p as any).escrowWallet?.totalReleased > 0).map(p => (
                  <Card key={p.id} className="p-4 lg:p-6 cursor-pointer border border-secondary-100" onClick={() => navigate(`/projects/${p.id}`)}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-text-tertiary">Received from</p>
                        <h3 className="font-semibold text-text-primary mt-0.5 line-clamp-1">{p.title}</h3>
                      </div>
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold text-brand-600">₹{Number((p as any).escrowWallet?.totalReleased ?? 0).toLocaleString()}</p>
                    <div className="mt-3">
                      <div className="w-full bg-secondary-100 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-brand-400 to-brand-600 h-1 rounded-full" 
                          style={{ width: `${((p as any).escrowWallet?.totalReleased / p.totalBudget) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-tertiary mt-2">₹{Number(p.totalBudget).toLocaleString()} total</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
