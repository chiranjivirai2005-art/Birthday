import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { auth } from '../firebase/config';
import { isFirebaseReady } from '../config/env';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!isFirebaseReady) {
      setError('Firebase is not configured yet. Replace the placeholder values in .env with your real Firebase project config, then restart the dev server.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('That email and password combination did not work. Make sure the user already exists in Firebase Authentication.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase Authentication.');
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid') {
        setError('The Firebase API key in .env is invalid. Replace it with the Web app API key from Firebase.');
      } else {
        setError(`Login failed: ${err.code || 'unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section auth-section">
      <motion.div
        className="auth-card card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow">Private entrance</span>
        <h1>Welcome Back</h1>
        <p>Sign in with the email and password already created in Firebase Authentication.</p>
        {!isFirebaseReady && (
          <p className="form-error">
            Firebase is still using placeholder `.env` values, so login cannot work yet.
          </p>
        )}
        <form onSubmit={handleSubmit} className="form-stack">
          <input className="input" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <span className="inline-spinner" /> : 'Login'}
          </button>
        </form>
      </motion.div>
    </main>
  );
};

export default Login;
