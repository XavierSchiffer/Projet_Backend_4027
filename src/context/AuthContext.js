import { createContext, useState, useEffect } from "react";
import { apiAccount } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    // 🔍 Vérification du stockage local au chargement
    useEffect(() => {
        console.log("🔍 Chargement initial du token depuis localStorage :", localStorage.getItem("token"));
        if (token) {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                if (storedUser) {
                    setUser(storedUser);
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération de l'utilisateur", error);
            }
        }
    }, []);

    // ✅ Mise à jour de l'état si le `token` change
    useEffect(() => {
        console.log("✅ Mise à jour du token :", token);
        setIsAuthenticated(!!token);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await apiAccount.post("/login/admin", { username, password });
            console.log("✅ Réponse complète du backend :", response.data);
    
            const userData = response.data[0]?.results[0];
            const newToken = userData?.token; // Vérification correcte du token
    
            if (!userData || !newToken) {
                throw new Error("Données utilisateur ou token manquants");
            }
    
            // Stocker les informations utilisateur et le token
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(userData));
            // localStorage.setItem("user", JSON.stringify(userData));
            console.log("🛠 Données utilisateur stockées :", localStorage.getItem("user"));

            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
    
            console.log("🔐 Utilisateur connecté :", userData);
            return userData; // 🔹 Retourner directement l'utilisateur
        } catch (error) {
            console.error("❌ Erreur de connexion", error);
            return null;
        }
    };
    
    const logout = () => {
        console.log("🚪 Déconnexion");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;