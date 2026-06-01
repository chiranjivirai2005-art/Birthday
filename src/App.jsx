import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import FloatingHearts from './components/FloatingHearts';
import PartyDecor from './components/PartyDecor';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Wishes from './pages/Wishes';
import Gallery from './pages/Gallery';
import PrivateMoments from './pages/PrivateMoments';
import SpecialDays from './pages/SpecialDays';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <PartyDecor />
        <Navbar />
        <FloatingHearts />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/wishes" element={<Wishes />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/private-moments" element={<ProtectedRoute intimateOnly><PrivateMoments /></ProtectedRoute>} />
            <Route path="/special-days" element={<ProtectedRoute intimateOnly><SpecialDays /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
