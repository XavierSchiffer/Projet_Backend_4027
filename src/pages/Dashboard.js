import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Settings, Moon, LogOut, X, Home } from "lucide-react";
import { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { apiFruit } from "../api";
import "./Dashboard_User.css";
import ProfilePic from "../components/assets/pdp.jpg";
import { useLocation } from 'react-router-dom';
// import SettingsPopup from "./SettingsPopup";
import SettingsPopupA from "./SettingsPopupA";
import React from "react";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);


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
          <h1 className="topbar-title">ADMIN SYSTÈME</h1>
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
        <SettingsPopupA 
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
              <Link to="/users-list">
                <span>📋 Liste des utilisateurs</span>
              </Link>
            </li>
            <li>
            <Link to="/add-user">
                <span>➕ Ajouter un utilisateur</span>
            </Link>
            </li>
            <li>
              <Link to="/assigner-secteur">
                <span>📌 Assigner un secteur</span>
              </Link>
            </li>
            <li>
              <Link to="/sector-list">
                <span>📋 Liste des secteurs</span>
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
    </div>
  );
  };

export default Dashboard;