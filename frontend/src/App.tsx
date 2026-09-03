import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppShell } from './components/AppShell';
import { FullPageSpinner } from './components/ui/Spinner';
import { DashboardProfessor } from './views/DashboardProfessor';
import { DashboardStudent } from './views/DashboardStudent';
import { InternshipDetail } from './views/InternshipDetail';
import { InternshipForm } from './views/InternshipForm';
import { Login } from './views/Login';
import { Register } from './views/Register';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'TEACHER' ? <DashboardProfessor /> : <DashboardStudent />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Protected>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/internships/new"
            element={
              <Protected>
                <AppShell>
                  <InternshipForm />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/internships/:id"
            element={
              <Protected>
                <AppShell>
                  <InternshipDetail />
                </AppShell>
              </Protected>
            }
          />
          <Route
            path="/internships/:id/edit"
            element={
              <Protected>
                <AppShell>
                  <InternshipForm />
                </AppShell>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
