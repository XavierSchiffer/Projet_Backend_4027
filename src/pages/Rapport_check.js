// import { useState, useEffect, useContext } from "react";
// import AuthContext from "../context/AuthContext";
// import { apiFruit } from "../api";
// import "./Dashboard_User.css";

import { Link, useNavigate } from "react-router-dom";
import { Upload, Bell, User, Settings, Moon, LogOut, Home, X } from "lucide-react";
import { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { apiFruit } from "../api";
import "./Rapport_check.css";
import ProfilePic from "../components/assets/pdp.jpg";


const RapportList = () => {
//   const { token } = useContext(AuthContext);
  const [rapports, setRapports] = useState([]);
//   const [loading, setLoading] = useState(true);

// 
const { token } = useContext(AuthContext);
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    const fetchRapports = async () => {
      try {
        const response = await apiFruit.get("/rapports/list/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data && Array.isArray(response.data.results)) {
          const sortedRapports = response.data.results.sort(
            (a, b) => new Date(b.date_envoi) - new Date(a.date_envoi)
          );
          setRapports(sortedRapports);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des rapports :", error);
      }
      setLoading(false);
    };

    fetchRapports();
  }, [token]);

  const handleHomeClick = () => {
    navigate('/dashboardU'); 
  };

  return (
    <div className="flex h-screen">
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">KHYZER SYSTÈME</h1>
      </div>
      <div className="topbar-right">
        <Home size={28} className="topbar-icon" onClick={handleHomeClick} />
        <Moon size={28} className="topbar-icon" />
        <Settings size={24} className="topbar-icon" />
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
        <User size={24} className="topbar-icon" />
      </div>
    </div>

{/* ############################################# */}
  {/* Sidebar */}
  <div className="sidebar">
      {/* Partie 1 - Profile */}
    <div className="sidebar-profile">
      <div className="profile-image">
      <img src={ProfilePic} alt="Profile" />
      </div>
      <div className="profile-name">
        {user.username ? user.username : "Utilisateur"} !
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
      <h1 className="page-title">Liste des rapports</h1>
      {loading ? (
        <p>Chargement en cours...</p>
      ) : (
        <div className="rapport-list">
          {rapports.length > 0 ? (
            rapports.map((rapport) => (
              <div key={rapport.id} className="rapport-item">
                <h3>{rapport.etat_global}</h3>
                <p><strong>Date :</strong> {new Date(rapport.date_envoi).toLocaleString()}</p>
                <p><strong>Quantité récoltée :</strong> {rapport.quantite_recolte} kg</p>
                <p><strong>Commentaire :</strong> {rapport.commentaire}</p>
                <div className="rapport-stats">
                  <p><strong>Papaye mûre :</strong> {rapport.pourcentage_papaye_mur}%</p>
                  <p><strong>Papaye semi-mûre :</strong> {rapport.pourcentage_papaye_semi_mur}%</p>
                  <p><strong>Papaye non mûre :</strong> {rapport.pourcentage_papaye_non_mur}%</p>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun rapport trouvé.</p>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default RapportList;
