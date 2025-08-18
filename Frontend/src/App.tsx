import Dashboard from './pages/Dashboard';
import Whiteboard from './pages/Whiteboard';
import { Routes, Route } from 'react-router';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/whiteboard/new" element={<Whiteboard />} />
      </Routes>
    </div>
  );
};

export default App
