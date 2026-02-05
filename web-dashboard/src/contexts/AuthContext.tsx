import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../api/config';

// User interface
interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'project_manager' | 'agronomist' | 'field_facilitator';
    language: string;
}

// Login response interface


// Auth context interface
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('aaywa_token');

                if (storedToken) {
                    // Decode JWT to check expiration
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    const isExpired = payload.exp * 1000 < Date.now();

                    if (isExpired) {
                        // Token expired, clear it
                        localStorage.removeItem('aaywa_token');
                        setToken(null);
                        setUser(null);
                    } else {
                        // Token valid, set state and fetch full profile
                        setToken(storedToken);
                        await fetchUserProfile(storedToken);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('aaywa_token');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Fetch user profile from API
    const fetchUserProfile = async (authToken: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401 || response.status === 403) {
                // Invalid or expired token, clear auth
                localStorage.removeItem('aaywa_token');
                setToken(null);
                setUser(null);
            } else {
                console.warn(`Profile fetch failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    // Login with Email/Password
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token
                localStorage.setItem('aaywa_token', data.token);
                setToken(data.token);
                setUser(data.user);

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Network error. Please try again.');
        }
    };

    // Update user profile
    const updateProfile = async (updates: Partial<User>) => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Update failed');
        }
    };

    // Logout
    const logout = () => {
        // Call logout endpoint (optional, for logging)
        if (token) {
            fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(err => console.error('Logout error:', err));
        }

        // Clear local state
        localStorage.removeItem('aaywa_token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
