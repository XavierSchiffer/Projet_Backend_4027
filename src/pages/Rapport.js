import { useLocation } from 'react-router-dom';

import { Link, useNavigate } from "react-router-dom";
import { Upload, Bell, User, Settings, Moon, LogOut, X, Home, Loader } from "lucide-react";
import { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { apiFruit } from "../api";
import "./Rapport.css";
import ProfilePic from "../components/assets/pdp.jpg";
import "./Dashboard_User.css";
import SettingsPopup from "./SettingsPopup";
import React from 'react';

const RapportPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [etat_global, setEtatRecolte] = useState("");
  const [quantite_recolte, setQuantite] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
//   const { token } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  
  // États pour la gestion des images
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
  // États pour les résultats de l'analyse
  const [analysisResults, setAnalysisResults] = useState(null);

  const notificationRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFruit.post("/secteurs/papaye/rapports/", {
        etat_global: etat_global,
        quantite_recolte: quantite_recolte,
        commentaire: commentaire,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  //     if (response.status === 201) {
  //       setSuccess(true);
  //       setTimeout(() => navigate("/"), 2000);
  //     }
  //   } catch (error) {
  //     console.error("❌ Erreur lors de l'envoi du rapport :", error);
  //   }
  //   setLoading(false);
  // };
        const responseData = response.data[0];

        if (responseData.state === "SUCCES") {
          setSuccess(responseData.message);
          setTimeout(() => navigate("/dashboardU"), 2000);
        } else {
          setError(responseData.message);
        }
      } catch (error) {
        setError("Une erreur est survenue lors de l'envoi du rapport");
        console.error("❌ Erreur lors de l'envoi du rapport :", error);
      }
      setLoading(false);
      };


  const fetchNotifications = async () => {
    try {
      const response = await apiFruit.get("/alertes/non_lues/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.alertes);
      setUnreadCount(response.data.alertes.length);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des notifications :", error);
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestionnaire pour le changement d'image
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Gestionnaire pour l'upload d'image
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedImage);

  try {
    const response = await apiFruit.post("/secteurs/papaye/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Réponse complète du backend :", response.data);

    if (response.data[0].state === "SUCCES") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
      setSuccess(true);
      setAnalysisResults(response.data[0].results[0]);

      setTimeout(() => {
        setSuccess(false);
        setSelectedImage(null);
        setPreview(null);
      }, 3000);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi :", error);
    setLoading(false);
  }
};

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiFruit.put(`/alertes/read/${notificationId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      fetchNotifications();
    } catch (error) {
      console.error("❌ Erreur lors du marquage comme lu :", error);
    }
  };

  const NotificationsPopup = () => (
    <div 
      ref={notificationRef}
      className="notifications-popup"
    >
      <div className="notifications-header">
        <h3>Notifications ({unreadCount})</h3>
        <button onClick={() => setShowNotifications(false)}>
          <X size={20} />
        </button>
      </div>
      
      <div className="notifications-content">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              {/* <div className="notification-date">{notification.date}</div> */}
              <div className="notification-date">{notification.date_envoi}</div>

            </div>
          ))
        ) : (
          <div className="no-notifications">
            Aucune notification
          </div>
        )}
      </div>
    </div>
  );

  const handleHomeClick = () => {
    navigate('/dashboardU');
  };

  const handleUserClick = async () => {
    navigate('/profil')
  };


  

  return (
    <div className="flex h-screen">
            <div className="topbar">
              {/* <div className="topbar"> */}
              <div className="topbar-left">
          <h1 className="topbar-title">KHYZER SYSTÈME</h1>
        </div>

      <div className="topbar-right">
      <Moon size={28} className="topbar-icon" />
      <div className="notifications-container">
        <Bell 
          size={24} 
          className="topbar-icon" 
          onClick={handleNotificationClick}
        />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
        {showNotifications && <NotificationsPopup />}
      </div>
      <button 
        className={`user-button ${location.pathname === '/profile' ? 'active' : ''}`}
        onClick={handleUserClick}
      >
        <User size={24} className="topbar-icon" />
      </button>
      <div style={{ position: 'relative' }}>
    <button 
      className={`icon-button ${showSettings ? 'active' : ''}`}
      onClick={() => setShowSettings(!showSettings)}
    >
      <Settings size={24} className="topbar-icon" />
    </button>
    {showSettings && (
      <>
        <div className="settings-overlay" onClick={() => setShowSettings(false)} />
        <SettingsPopup 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </>
    )}
  </div>
      {/* <Settings size={24} className="topbar-icon" /> */}
    </div>
      </div>

    {/* Sidebar */}
    <div className="sidebar">
        {/* Partie 1 - Profile */}
      <div className="sidebar-profile">
        <div className="profile-image">
          <img src={ProfilePic} alt="Profile" />
        </div>
        <div className="profile-name">
          {user.username ? user.username : "Utilisateur"}
        </div>
        <div className="home-button">
          <Home size={28} className="sidebar-icon" onClick={handleHomeClick} />
        </div>
      </div>

      {/* Partie 2 - Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/rapport">
              <span>📄 Faire un rapport</span>
            </Link>
          </li>
          <li>
            <Link to="/statistiques">
              <span>📊 Consulter les statistiques</span>
            </Link>
          </li>
          <li>
            <Link to="/rapport-list">
              <span>📑 Consulter un rapport</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Partie 3 - Logout */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={() => { logout(); navigate("/loginUser"); }}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>

    <div className="main-content">
      <h1 className="page-title">Faire un rapport</h1>
      <form onSubmit={handleSubmit} className="rapport-form">
        <label>État global de la récolte :</label>
        <input 
          type="text" 
          value={etat_global} 
          onChange={(e) => setEtatRecolte(e.target.value)}
          required 
        />

        <label>Quantité de fruits récoltés :</label>
        <input 
          type="number" 
          value={quantite_recolte} 
          onChange={(e) => setQuantite(e.target.value)}
          required 
        />

        <label>Commentaire :</label>
        <textarea 
          value={commentaire} 
          onChange={(e) => setCommentaire(e.target.value)}
          required 
        />

        {/* <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Envoi en cours..." : "Soumettre le rapport"}
        </button> */}
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
                  Envoi en cours...
                    </>
                    ) : 'Somettre le rapport'}
        </button>
      </form>
      {/* {success && <p className="success-message">Rapport soumis avec succès !</p>} */}
    </div>
    </div>
  );
};

export default RapportPage;