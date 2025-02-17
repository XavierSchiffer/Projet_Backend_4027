import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Loader } from 'lucide-react';
import './EditProfile.css';
import AuthContext from "../context/AuthContext";
import { apiAccount } from "../api";


const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await apiAccount.get("/users/info", {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Données reçues:", response.data); // Ajoute ceci pour debug

        if (response.data.etat === "SUCCES") {
            setFormData(response.data.res);  // Corrigé ici
        } else {
            setError(response.data.msg || "Erreur lors de la récupération des informations");
        }
    } catch (error) {
        setError("Erreur lors de la récupération des informations");
        console.error("❌ Erreur lors de la récupération des informations:", error);
    } finally {
        setInitialLoad(false);
    }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await apiAccount.put("/users/update", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const responseData = response.data[0];

      if (responseData.state === "SUCCES") {
        setSuccess(responseData.message);
        setTimeout(() => navigate("/dashboardU"), 2000);
      } else {
        setError(responseData.message);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la mise à jour du profil");
      console.error("❌ Erreur lors de la mise à jour:", error);
    }
    setLoading(false);
  };

  if (initialLoad) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin" size={40} />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="profile-card">
        <div className="card-header">
          <h2>Modifier mon profil</h2>
          <p className="header-description">Mettez à jour vos informations personnelles</p>
        </div>

        <div className="card-content">
            <form onSubmit={handleSubmit}>
                <div className="form-layout">
                    {/* Section nom d'utilisateur centrée */}
                    <div className="username-section">
                    <div className="input-group">
                        {/* <label>Nom d'utilisateur</label> */}
                        <label style={{ paddingLeft: "130px" }}>Nom d'utilisateur</label>

                        <div className="input-wrapper">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        </div>
                    </div>
                    </div>

                    {/* Grille 2x2 pour les autres champs */}
                    <div className="form-grid">
                    <div className="input-group">
                        <label>Nom</label>
                        <div className="input-wrapper">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Prénom</label>
                        <div className="input-wrapper">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Téléphone</label>
                        <div className="input-wrapper">
                        <Phone size={20} className="input-icon" />
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        </div>
                    </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? (
                    <>
                        <Loader size={20} className="animate-spin" />
                        Mise à jour en cours...
                    </>
                    ) : 'Mettre à jour le profil'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;