import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Page Imports
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import CreateProjectWizard from "./pages/CreateProjectWizard";
import ProjectDetail from "./pages/ProjectDetail";
import DisputeChat from "./pages/DisputeChat";
import InvoicePreview from "./pages/InvoicePreview";
import JobBoard from "./pages/JobBoard";
import { useMyNotifications, useMarkNotificationRead } from "./api/useNotifications";
import { useMemo, useState } from "react";

// Role-based auth guard wrapper
const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element, allowedRole?: string }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole && user.role !== "ADMIN") return <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace />;
  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { data: notifications = [] } = useMyNotifications(isAuthenticated);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const markRead = useMarkNotificationRead();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation placeholder */}
        <nav className="border-b p-4 flex justify-between items-center bg-white">
          <h1 className="text-xl font-bold font-mono tracking-tight text-trust-green">Trust-Bound</h1>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button
                  className="text-sm"
                  onClick={() => setShowNotifs((s) => !s)}
                >
                  Notifications{unreadCount ? ` (${unreadCount})` : ""}
                </button>
                <span className="text-sm text-gray-600">Logged in as {user?.email} ({user?.role})</span>
                <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }} className="text-sm text-trust-red hover:underline">Logout</button>
              </div>
            ) : (
              <a href="/login" className="text-trust-blue hover:underline">Log in</a>
            )}
          </div>
        </nav>
        {isAuthenticated && showNotifs && (
          <div className="border-b bg-white px-4 py-3">
            <div className="max-w-5xl mx-auto space-y-2">
              {notifications.length === 0 ? (
                <div className="text-sm text-gray-500">No notifications yet.</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{n.title}</div>
                      <div className="text-sm text-gray-600">{n.body}</div>
                    </div>
                    {!n.isRead && (
                      <button
                        className="text-sm text-trust-blue hover:underline"
                        onClick={() => markRead.mutate(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dynamic Outlet */}
        <main className="flex-1 bg-background text-foreground relative p-4 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to={`/${user?.role.toLowerCase()}-dashboard`} replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/client-dashboard" element={<ProtectedRoute allowedRole="CLIENT"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/freelancer-dashboard" element={<ProtectedRoute allowedRole="FREELANCER"><FreelancerDashboard /></ProtectedRoute>} />
            
            <Route path="/projects/new" element={<ProtectedRoute allowedRole="CLIENT"><CreateProjectWizard /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            
            <Route path="/projects/:projectId/dispute/:id" element={<ProtectedRoute><DisputeChat /></ProtectedRoute>} />
            <Route path="/projects/:projectId/invoice" element={<ProtectedRoute><InvoicePreview /></ProtectedRoute>} />
            <Route path="/job-board" element={<ProtectedRoute allowedRole="FREELANCER"><JobBoard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
