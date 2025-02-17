import { Box, IconButton, useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../../src/theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useLocation } from 'react-router-dom';

import { Link, useNavigate } from "react-router-dom";
import { Upload, Bell, User, Settings, Moon, LogOut, X, Home, Sun } from "lucide-react";
import { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { apiFruit } from "../api";
import "./Dashboard_User.css";
import ProfilePic from "../components/assets/pdp.jpg";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import React from "react";
import SettingsPopup from "./SettingsPopup";


const DashboardU = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const { token } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();  // Ajoutez cette ligne
  
  const [latestPapayaData, setLatestPapayaData] = useState({
    pourcentage_papaye_non_mur: 0,
    pourcentage_papaye_semi_mur: 0,
    pourcentage_papaye_mur: 0,
    date_derniere_analyse: "N/A",
  });

  const [papayaList, setPapayaList] = useState([]);  
  // États pour la gestion des images
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // États pour les résultats de l'analyse
  const [analysisResults, setAnalysisResults] = useState(null);

  const notificationRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Dans votre composant principal
  const [showSettings, setShowSettings] = useState(false);


  const fetchPapayaInfo = async () => {
    try {
        const response = await apiFruit.get("/papayes/list/", {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Réponse du backend :", response.data);

        if (response.data.length > 0 && response.data[0].state === "SUCCES") {
            const papayaList = response.data[0].results;

            if (papayaList.length > 0 && papayaList[0].length > 0) {
                const latestPapaya = papayaList[0][0]; // Extraire la première papaye de la liste

                setLatestPapayaData({
                    pourcentage_papaye_non_mur: parseFloat(latestPapaya.pourcentage_papaye_non_mur),
                    pourcentage_papaye_semi_mur: parseFloat(latestPapaya.pourcentage_papaye_semi_mur),
                    pourcentage_papaye_mur: parseFloat(latestPapaya.pourcentage_papaye_mur),
                    date_derniere_analyse: latestPapaya.date_derniere_analyse || "N/A",
                });

                console.log("✅ Données mises à jour :", latestPapaya);
            } else {
                console.warn("⚠️ Aucune donnée de papaye trouvée.");
            }
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des informations sur la papaye :", error);
    }
};
  useEffect(() => {
    if (token) {
      fetchPapayaInfo();
    }
  }, [token]);


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
  const handleUserClick = async () => {
    navigate('/profil')
  };
  
  const handleHomeClick = () => {
    navigate('/dashboardU');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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
      {/* Main Content */}
      <div className="main-content">
        <h1>Sélectionnez une image</h1>
        <div className="cards-container">
          {/* Upload Card */}
          <div className="upload-card">
            <input type="file" accept="image/*" onChange={handleImageChange} id="upload" />
            <label htmlFor="upload">
              <Upload />
              <p>Cliquez pour sélectionner une image</p>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="preview-card">
              <img src={preview} alt="Prévisualisation" />
              <button className="upload-button" onClick={handleUpload}>Envoyer l'image</button>
            </div>
          )}
        </div>
      </div>

      {/* ##################### */}

      <div className="resultat w-1/2">
  {(analysisResults || latestPapayaData.pourcentage_papaye_mur > 0) ? (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6">Résultats de l'analyse</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="stat-percentage">
            {analysisResults?.pourcentage_papaye_non_mur ?? latestPapayaData.pourcentage_papaye_non_mur}%
          </div>
          <div className="stat-label">Papaye non-mûre</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-percentage">
            {analysisResults?.pourcentage_papaye_semi_mur ?? latestPapayaData.pourcentage_papaye_semi_mur}%
          </div>
          <div className="stat-label">Papaye semi-mûre</div>
        </div>
        
        <div className="stat-card col-span-2">
          <div className="stat-percentage">
            {analysisResults?.pourcentage_papaye_mur ?? latestPapayaData.pourcentage_papaye_mur}%
          </div>
          <div className="stat-label">Papaye mûre</div>
        </div>
      </div>
      
      <div className="date-analyse mt-6">
        Date d'analyse : {analysisResults?.date_derniere_analyse ?? latestPapayaData.date_derniere_analyse}
      </div>
      {/* Ajout du diagramme circulaire */}
      <div className="chart-container mt-6">
        <h3 className="text-xl font-semibold mb-4">Distribution par Maturité</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: 'Mûres', value: parseFloat(analysisResults?.pourcentage_papaye_mur ?? latestPapayaData.pourcentage_papaye_mur) },
                { name: 'Non Mûres', value: parseFloat(analysisResults?.pourcentage_papaye_non_mur ?? latestPapayaData.pourcentage_papaye_non_mur) },
                { name: 'Semi-Mûres', value: parseFloat(analysisResults?.pourcentage_papaye_semi_mur ?? latestPapayaData.pourcentage_papaye_semi_mur) }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {[latestPapayaData.pourcentage_papaye_mur, latestPapayaData.pourcentage_papaye_non_mur, latestPapayaData.pourcentage_papaye_semi_mur].map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 py-8">
      <h3 className="text-xl font-semibold mb-4">Distribution par Maturité</h3>
      <p className="text-xl">Aucun résultat pour le moment</p>
      <p className="text-sm mt-2">Envoyez une image pour obtenir une analyse</p>
    </div>
  )}
  
</div>

    </div>
  );
};

export default DashboardU;