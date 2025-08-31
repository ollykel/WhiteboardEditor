import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from '@/pages/Dashboard';
import Whiteboard from '@/pages/Whiteboard';
import UserAuth from '@/pages/UserAuth';
import AccountSettings from '@/pages/AccountSettings';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/** Public Routes **/}
          <Route path="/login" element={<UserAuth action="login"/>} />
          <Route path="/signup" element={<UserAuth action="signup"/>} />

          {/** Protected Routes **/}
          <Route path="/" element={
            <ProtectedRoute fallback="/login">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute fallback="/login">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute fallback="/login">
              <AccountSettings />
            </ProtectedRoute>
          } />
          <Route path="/whiteboard/new" element={
            <ProtectedRoute fallback="/login">
              <Whiteboard />
            </ProtectedRoute>
          } />
        </Routes>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App
