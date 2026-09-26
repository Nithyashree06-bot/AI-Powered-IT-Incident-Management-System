import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, SEED_USERS } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, department?: string) => Promise<void>;
  demoLogin: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved token and user on initialization
    const savedToken = localStorage.getItem('incidentiq_token');
    const savedUserJson = localStorage.getItem('incidentiq_user');

    if (savedToken && savedUserJson) {
      try {
        const parsedUser = JSON.parse(savedUserJson) as User;
        setUser(parsedUser);
        setToken(savedToken);
      } catch (err) {
        console.error('Failed to parse saved user', err);
        localStorage.removeItem('incidentiq_token');
        localStorage.removeItem('incidentiq_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Attempt backend Spring Boot API
      const res = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userProfile } = res.data.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem('incidentiq_token', jwtToken);
      localStorage.setItem('incidentiq_user', JSON.stringify(userProfile));
    } catch (err) {
      // Offline fallback for preview environments: match seed credentials
      const matchedRole = (Object.keys(SEED_USERS) as Role[]).find(
        (r) => SEED_USERS[r].email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedRole && password === 'password123') {
        const dummyToken = `demo_jwt_token_${matchedRole.toLowerCase()}_${Date.now()}`;
        const u = SEED_USERS[matchedRole];
        setToken(dummyToken);
        setUser(u);
        localStorage.setItem('incidentiq_token', dummyToken);
        localStorage.setItem('incidentiq_user', JSON.stringify(u));
        return;
      }
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  const register = async (name: string, email: string, password: string, department?: string): Promise<void> => {
    try {
      const res = await api.post('/auth/register', { name, email, password, department });
      const { token: jwtToken, user: userProfile } = res.data.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem('incidentiq_token', jwtToken);
      localStorage.setItem('incidentiq_user', JSON.stringify(userProfile));
    } catch (err) {
      // Offline demo fallback
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 10,
        name,
        email,
        role: 'EMPLOYEE',
        department: department || 'General IT',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const dummyToken = `demo_jwt_token_employee_${Date.now()}`;
      setToken(dummyToken);
      setUser(newUser);
      localStorage.setItem('incidentiq_token', dummyToken);
      localStorage.setItem('incidentiq_user', JSON.stringify(newUser));
    }
  };

  const demoLogin = (role: Role) => {
    const u = SEED_USERS[role];
    const dummyToken = `demo_jwt_token_${role.toLowerCase()}_${Date.now()}`;
    setToken(dummyToken);
    setUser(u);
    localStorage.setItem('incidentiq_token', dummyToken);
    localStorage.setItem('incidentiq_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('incidentiq_token');
    localStorage.removeItem('incidentiq_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
