import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Card, Button, Badge } from "../components/ui/core";
import { useNavigate } from "react-router-dom";
import { useMyProjects, useLinkFreelancer } from "../api/useProjects";
import { InviteFreelancerModal } from "../components/Modal/InviteFreelancerModal";

interface ClientDashboardProps {
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
    id: "projects",
    label: "Projects",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    disabled: true,
  },
];

const statCards = [
  {
    label: "In Escrow",
    value: 0,
    prefix: "₹",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    label: "Released",
    value: 0,
    prefix: "₹",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    label: "Active",
    value: 0,
    prefix: "",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    label: "Completed",
    value: 0,
    prefix: "",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
];

export default function ClientDashboard({ onMenuToggle }: ClientDashboardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useMyProjects();
  const linkFreelancer = useLinkFreelancer();

  const [activeNav, setActiveNav] = useState("overview");
  const [invitingProject, setInvitingProject] = useState<{ id: string; title: string } | null>(null);

  const inEscrow = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalDeposited ?? 0), 0);
  const released = projects.reduce((sum, p) => sum + Number((p as any).escrowWallet?.totalReleased ?? 0), 0);
  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const completed = projects.filter(p => p.status === "COMPLETED").length;

  const stats = [
    { ...statCards[0], value: inEscrow },
    { ...statCards[1], value: released },
    { ...statCards[2], value: activeProjects },
    { ...statCards[3], value: completed },
  ];

  const handleInviteFreelancer = async (email: string) => {
    if (!invitingProject) return;
    await linkFreelancer.mutateAsync({ projectId: invitingProject.id, email });
  };

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
            <span className="font-bold text-text-primary">Trust-Bound</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeNav === item.id
                  ? "bg-gray-900 text-white"
                  : item.disabled
                  ? "text-secondary-300 cursor-not-allowed"
                  : "text-secondary-600 hover:bg-secondary-100 hover:text-text-primary"
              }`}
            >
              {item.icon}
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-xs text-secondary-400 bg-secondary-100 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.displayName}</p>
              <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 lg:top-0 z-30">
          {/* Mobile menu button */}
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
            onClick={() => navigate('/projects/new')} 
            size="sm"
            className="shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">New Project</span>
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

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-text-primary">Your Projects</h2>
                <p className="hidden sm:block text-xs lg:text-sm text-text-tertiary mt-0.5">Manage and track your work</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-text-primary mb-2">No projects yet</h3>
                <p className="text-xs lg:text-sm text-text-secondary mb-6 max-w-xs mx-auto">
                  Create your first project to start accepting work and get paid securely.
                </p>
                <Button variant="primary" onClick={() => navigate('/projects/new')}>
                  Create First Project
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {projects.map((p) => {
                  const deposited = Number((p as any).escrowWallet?.totalDeposited ?? 0);
                  const releasedAmount = Number((p as any).escrowWallet?.totalReleased ?? 0);
                  const progress = deposited > 0 ? (releasedAmount / deposited) * 100 : 0;

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
                          <span className="text-text-tertiary">Budget</span>
                          <span className="font-medium text-text-primary">₹{Number(p.totalBudget).toLocaleString()}</span>
                        </div>
                        
                        {deposited > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-tertiary">Released</span>
                              <span className="text-brand-600 font-medium">₹{releasedAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-secondary-100 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-brand-400 to-brand-600 h-1 rounded-full transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {p.status === "DRAFT" && !p.freelancerId && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={(e) => { e.stopPropagation(); setInvitingProject({ id: p.id, title: p.title }); }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Invite Freelancer
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {invitingProject && (
        <InviteFreelancerModal
          projectTitle={invitingProject.title}
          onInvite={handleInviteFreelancer}
          onClose={() => setInvitingProject(null)}
          isLoading={linkFreelancer.isPending}
        />
      )}
    </div>
  );
}
