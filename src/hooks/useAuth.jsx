import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserRole, isAdminEmail, isSpecialEmail } from '../utils/roles';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    role: getUserRole(user),
    isAdmin: isAdminEmail(user?.email),
    isSpecial: isSpecialEmail(user?.email),
    isLoggedIn: Boolean(user),
  };
};
