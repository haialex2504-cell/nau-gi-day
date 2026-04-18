'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/utils/firebase/client';
import { setSession, removeSession } from '@/app/[lang]/actions/firebase-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Avoid triggering multiple session API calls in rapid succession
let lastTokenHash = '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        // Optimize: Don't hit the server action if the token hasn't changed
        // For simplicity, we just use the raw token length as a quick hash check or just the token
        if (lastTokenHash !== token) {
          lastTokenHash = token;
          await setSession(token);
        }
        setUser(currentUser);
      } else {
        if (lastTokenHash !== 'null') {
          lastTokenHash = 'null';
          await removeSession();
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
