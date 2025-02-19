import React, { useRef, useState, useEffect, useContext } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Link, useNavigate } from "react-router-dom";
import { Upload, Bell, User, Settings, Moon, LogOut, Home, X } from "lucide-react";
import AuthContext from "../context/AuthContext";
import { apiFruit } from "../api";
import ProfilePic from "../components/assets/pdp.jpg";
import "./Dashboard_User.css";
import { useLocation } from 'react-router-dom';
import SettingsPopup from "./SettingsPopup";


const DashboardA = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

// États pour la gestion des images
const [selectedImage, setSelectedImage] = useState(null);
const [preview, setPreview] = useState(null);
const [success, setSuccess] = useState(false);
// États pour les résultats de l'analyse
const [analysisResults, setAnalysisResults] = useState(null);
const handleUserClick = async () => {
  navigate('/profil')
};
const location = useLocation();  // Ajoutez cette ligne
const [showSettings, setShowSettings] = useState(false);


const notificationRef = useRef(null);

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
// 

  const handleHomeClick = () => {
    navigate('/dashboardU'); 
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  // const fetchStatsData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await apiFruit.get("/secteurs/papaye/stat/", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const extractedData = response.data?.[0]?.results?.[0] || [];
  //     setStatsData(extractedData);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("❌ Erreur lors du chargement des statistiques :", error);
  //     setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
  //     setLoading(false);
  //   }
  // };

  const fetchStatsData = async () => {
    try {
        setLoading(true);
        const response = await apiFruit.get("/secteurs/papaye/stat/", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data[0].state === "ECHEC") {
            setError(response.data[0].message); // Stocke le message d'erreur
            setStatsData([]); // Réinitialise les données
        } else {
            const extractedData = response.data?.[0]?.results?.[0] || [];
            setStatsData(extractedData);
            setError(null);
        }

        setLoading(false);
    } catch (error) {
        console.error("❌ Erreur lors du chargement des statistiques :", error);
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
        setLoading(false);
    }
};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  const latestStats = statsData.length > 0 ? statsData[statsData.length - 1] : null;

  return (
    <div className="flex h-screen">
      {/* Topbar */}
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
    <h1>Statistiques de Récolte des Papayes</h1>
    {loading ? (
        <p>Chargement des statistiques...</p>
    ) : error ? (
        <p className="error-message">{error}</p> // Affiche le message d'erreur
    ) : (
        statsData.length > 0 ? (
          <div className="dashboard-grid">
          {/* Évolution des Quantités */}
          <div className="dashboard-card">
            <h2>Évolution des Quantités</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantite_recolte" stroke="#0088FE" name="Quantité Récoltée" />
                <Line type="monotone" dataKey="quantite_non_recolter" stroke="#FF8042" name="Quantité Non Récoltée" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution par Maturité */}
          <div className="dashboard-card">
            <h2>Distribution par Maturité</h2>
            {latestStats && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={[
                    { name: 'Mûres', value: parseFloat(latestStats.pourcentage_papaye_mur) },
                    { name: 'Non Mûres', value: parseFloat(latestStats.pourcentage_papaye_non_mur) },
                    { name: 'Semi-Mûres', value: parseFloat(latestStats.pourcentage_papaye_semi_mur) }
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Évolution des Pourcentages de Maturité */}
          <div className="dashboard-card full-width">
            <h2>Évolution des Pourcentages de Maturité</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pourcentage_papaye_mur" fill="#0088FE" name="Mûres" />
                <Bar dataKey="pourcentage_papaye_non_mur" fill="#00C49F" name="Non Mûres" />
                <Bar dataKey="pourcentage_papaye_semi_mur" fill="#FFBB28" name="Semi-Mûres" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        ) : (
            <p className="error-message">Aucune donnée de statistique trouvée pour votre secteur.</p>
        )
    )}
</div>

    </div>
  );
};

export default DashboardA;
