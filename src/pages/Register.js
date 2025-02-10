import React, { useState, useEffect } from "react";
import { apiAccount } from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        role: "GESTIONNAIRE", // Par défaut, on enregistre un gestionnaire
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Récupérer l'utilisateur et le token depuis localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);

            if (storedUser.role !== "ADMIN") {
                setError("Accès refusé. Seuls les administrateurs peuvent ajouter un utilisateur.");
            }
        } else {
            setError("Erreur d'authentification. Veuillez vous reconnecter.");
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        if (!token) {
            setError("Erreur d'authentification. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            console.log("Token utilisé pour la requête :", token);

            const response = await apiAccount.post("/admin/registration/users", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Token récupéré avant la requête :", token);
            console.log("En-têtes envoyés :", {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            });

            const tokenParts = token.split(".");
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Contenu du token :", payload);
            console.log("Expiration du token :", new Date(payload.exp * 1000));


            console.log("Réponse du backend :", response.data);

            setMessage("Gestionnaire enregistré avec succès !");
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error.response?.data || error);
            setError(error.response?.data?.message || "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div>
            <h2>Ajouter un Gestionnaire</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required />
                <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="text" name="telephone" placeholder="Téléphone" onChange={handleChange} />
                <button type="submit" disabled={loading}>
                    {loading ? "Enregistrement..." : "Créer le compte"}
                </button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
};

export default Register;
