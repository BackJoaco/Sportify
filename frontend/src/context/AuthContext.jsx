import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api/user.api";
import { logout as logoutApi } from "../api/auth.api";
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadUser() {
        try {
            const data = await getProfile();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);


    async function logout() {
        await logoutApi();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loadUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);