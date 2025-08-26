import Dashboard from './pages/Dashboard';
import Whiteboard from './pages/Whiteboard';
import UserAuth from './pages/UserAuth';
import { Routes, Route } from 'react-router';
import { AuthProvider } from './AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<UserAuth action="login"/>} />
        <Route path="/signup" element={<UserAuth action="signup"/>} />
        <Route path="/whiteboard/new" element={<Whiteboard />} />
      </Routes>
    </AuthProvider>
  );
};

export default App
