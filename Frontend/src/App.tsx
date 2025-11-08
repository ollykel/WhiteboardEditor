import {
  Routes,
  Route,
} from 'react-router-dom';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  ToastContainer,
  Bounce,
} from 'react-toastify';

import Dashboard from '@/pages/Dashboard';
import Whiteboard from '@/pages/Whiteboard';
import UserAuth from '@/pages/UserAuth';
import {
  UserCacheProvider,
} from '@/context/UserCacheContext';
import AccountSettings from '@/pages/AccountSettings';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <UserCacheProvider>
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
            <Route path="/whiteboard/:whiteboard_id" element={
              <ProtectedRoute fallback="/login">
                <Whiteboard />
              </ProtectedRoute>
            } />
          </Routes>

          {/** Misc. overlays and modals **/}
          <>
            {/** Toast allows us to display styled popup alerts **/}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </>
        </QueryClientProvider>
      </UserCacheProvider>
    </AuthProvider>
  );
};

export default App
