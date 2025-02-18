import { apiAccount, apiFruit } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Bell, User, Settings, Moon, LogOut, X, Home, Sun } from "lucide-react";

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import './EditePass.css';
import "./EditPass.css";
import SettingsPopup from "./SettingsPopup";
import { useLocation } from 'react-router-dom';
import { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import ProfilePic from "../components/assets/pdp.jpg";



const EditPasswordA = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
//   #########################################################

const { token } = useContext(AuthContext);
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const location = useLocation(); 


const [papayaList, setPapayaList] = useState([]);  
// États pour la gestion des images

const notificationRef = useRef(null);
const { user, logout } = useContext(AuthContext);
// Dans votre composant principal
const [showSettings, setShowSettings] = useState(false);
// ############################################################

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await apiAccount.post("/users/update/pass", {
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accéder au premier élément du tableau de réponse
      const responseData = response.data[0];

      if (responseData.state === "SUCCES") {
        setSuccess(responseData.message);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(responseData.message);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la modification du mot de passe");
      console.error("❌ Erreur lors de la modification du mot de passe:", error);
    }
    setLoading(false);
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
    navigate('/dashboard');
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

    <div className="edit-password-container">
      <div className="password-card">
        <div className="card-header">
          <h2>Modifier le mot de passe</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="password-input">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  placeholder="Mot de passe actuel"
                  value={formData.current_password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="toggle-password"
                >
                  {showPasswords.current ? 
                    <EyeOff size={20} /> : 
                    <Eye size={20} />
                  }
                </button>
              </div>
            </div>

            <div className="input-group">
              <div className="password-input">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  placeholder="Nouveau mot de passe"
                  value={formData.new_password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="toggle-password"
                >
                  {showPasswords.new ? 
                    <EyeOff size={20} /> : 
                    <Eye size={20} />
                  }
                </button>
              </div>
            </div>

            <div className="input-group">
              <div className="password-input">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="toggle-password"
                >
                  {showPasswords.confirm ? 
                    <EyeOff size={20} /> : 
                    <Eye size={20} />
                  }
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditPasswordA;