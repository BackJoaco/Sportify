import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api/usuario.api";
import { logout as logoutApi } from "../api/auth.api";
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadUsuario() {
        try {
            const data = await getProfile();
            setUsuario(data);
        } catch {
            setUsuario(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsuario();
    }, []);


    async function logout() {
        await logoutApi();
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, loadUsuario, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);