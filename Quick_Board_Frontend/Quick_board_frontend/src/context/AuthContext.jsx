import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = authService.getToken();
        const userData = authService.getUser();
        
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(userData);
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    };

    const logout = () => {
        authService.removeToken();
        authService.removeUser();
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login';
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
