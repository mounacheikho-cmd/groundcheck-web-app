import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThresholdsProvider } from './context/ThresholdsContext';
import { Home } from './screens/Home';
import { Login } from './screens/Login';
import { NotFound } from './screens/NotFound';
import { Result } from './screens/Result';
import { Signup } from './screens/Signup';
import { Thresholds } from './screens/Thresholds';
import { Welcome } from './screens/Welcome';

/** Sends signed-out visitors to Log in and brings them back afterwards. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Signed-in users skip the Welcome, Log in and Sign up screens. */
function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><Welcome /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/result/:task" element={<RequireAuth><Result /></RequireAuth>} />
      <Route path="/thresholds" element={<RequireAuth><Thresholds /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function Providers({ children, queryClient: client }: { children: ReactNode; queryClient?: QueryClient }) {
  const [queryClient] = useState(() => client ?? new QueryClient({ defaultOptions: { queries: { retry: 2 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ThresholdsProvider>{children}</ThresholdsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  );
}
