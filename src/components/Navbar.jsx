import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { auth } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import MusicToggle from './MusicToggle';

const Navbar = () => {
  const { user, isAdmin, isSpecial } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="brand">
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            🎂 Birthday Keepsake
          </motion.span>
        </Link>
        <div className="nav-links">
          {user && <Link to="/wishes" className="nav-link">💌 Wishes</Link>}
          {user && <Link to="/gallery" className="nav-link">📸 Gallery</Link>}
          {user && (isAdmin || isSpecial) && <Link to="/private-moments" className="nav-link">💖 Private Moments</Link>}
          {user && (isAdmin || isSpecial) && <Link to="/special-days" className="nav-link">🌟 Special Days</Link>}
          {user && isAdmin && <Link to="/admin" className="nav-link">🛠️ Dashboard</Link>}
        </div>
        <div className="nav-actions">
          <MusicToggle />
          {user ? (
            <button onClick={handleLogout} className="nav-button">👋 Logout</button>
          ) : (
            <Link to="/login" className="nav-button">🔐 Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
