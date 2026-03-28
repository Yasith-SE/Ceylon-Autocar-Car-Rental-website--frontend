import { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
    // This state will hold user data like: { name: "John", role: "ADMIN" }
    const [user, setUser] = useState({ name: "Yasith", role: "ADMIN" }); 

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context easily in other components
export const useAuth = () => {
    return useContext(AuthContext);
};