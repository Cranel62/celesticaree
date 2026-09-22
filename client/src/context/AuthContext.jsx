import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        if (data.user.zodiac_sign) sessionStorage.setItem('zodiac_sign', data.user.zodiac_sign);
        if (data.user.undertone) sessionStorage.setItem('undertone', data.user.undertone);
        if (data.user.season) sessionStorage.setItem('season', data.user.season);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // GET: Fetch user profile (only runs if already authenticated or explicitly instructed)
const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (!res.ok) {
        // Expected when user is not logged in
        if (res.status === 401) setUser(null);
        return null;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch {
      setUser(null);
    }
    return null;
  };

  // POST: Create or onboard profile attributes
  const createProfile = async (profileData) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // UPDATE / PUT: Update existing user profile
  const updateUserProfile = async (formData) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // DELETE: Delete account across both databases and clear sessions
  const deleteUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        sessionStorage.clear();
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginUser = async (userDataOrEmail, password) => {
    if (userDataOrEmail && typeof userDataOrEmail === 'object') {
      setUser(userDataOrEmail);
      return { success: true, user: userDataOrEmail };
    }

    const email = userDataOrEmail;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      sessionStorage.clear();
    }
  };

  const updateUserProfileData = (fields) => {
    setUser(prev => (prev ? { ...prev, ...fields } : fields));
    Object.entries(fields).forEach(([k, v]) => {
      if (v) sessionStorage.setItem(k, v);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        fetchUserProfile,
        createProfile,
        updateUserProfile,
        deleteUserProfile,
        loginUser,
        logoutUser,
        updateUserProfileData,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}