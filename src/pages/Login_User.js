import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
// import api from "../api";
import { FaLock, FaUser } from "react-icons/fa";
import './Login.css';


const LoginUser = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate("/dashboardU");
        } else {
            alert("Échec de la connexion, vérifiez vos identifiants.");
        }
    };

    return (
    <div className="login-container">
        <div className="wrapper">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FaUser className="icon"/>
                </div>

                <div className="input-box">
                    {/* <Lock className="absolute left-3 top-3 text-white" /> */}
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full pl-10 p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FaLock className="icon"/>
                </div>

                    {/* Options */}
                <div className="remember-forgot">
                <label>
                    <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="hover:underline">Forgot password?</a>
                </div>

                        {/* Bouton Login */}
                <button 
                className="w-full bg-white text-purple-900 font-bold py-3 rounded-lg hover:bg-purple-700 hover:text-white transition"
                type="submit"
                >
                Se connecter
                </button>
            </form>
        </div>
    </div>
    );
};

export default LoginUser;
