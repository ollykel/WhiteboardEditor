import { Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from './pages/Dashboard';
import Whiteboard from './pages/Whiteboard';
import UserAuth from './pages/UserAuth';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<UserAuth action="login"/>} />
          <Route path="/signup" element={<UserAuth action="signup"/>} />
          <Route path="/whiteboard/new" element={<Whiteboard />} />
        </Routes>
      </QueryClientProvider>
    </div>
  );
};

export default App
