import { useLocation } from 'react-router-dom';
import React, { useState, useContext, useRef, useEffect } from "react";
import { Phone, Mail, Pencil, User as UserIcon } from 'lucide-react';
import AuthContext from "../context/AuthContext";
import { apiAccount } from "../api";
import "./UserProfil.css";
import ProfilePic from "../components/assets/pdp.jpg";
import { 
    Box, 
    Typography, 
    Button, 
    useTheme, 
    IconButton, 
    Tooltip 
  } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { 
    ArrowBackIosNew as BackIcon, 
    RefreshOutlined as RefreshIcon, 
    FilterListOutlined as FilterIcon, 
    CloudDownloadOutlined as ExportIcon,
    VisibilityOutlined as ViewIcon,
    DeleteOutlined as DeleteIcon
  } from '@mui/icons-material';
import { tokens } from "../theme";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const colors = tokens(theme.palette.mode);
//   const theme = useTheme();
    const location = useLocation();  // Ajoutez cette ligne
  
useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await apiAccount.get("/users/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.res) {
          setUserInfo(response.data.res);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des informations utilisateur:", error);
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [token]);
  
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Chargement des informations...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
                <Tooltip title="Retour à la page précédente">
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              borderRadius: 2,
              '&:hover': {
                backgroundColor: colors.blueAccent[600],
              }
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={ProfilePic} alt="Photo de profil" />
          </div>
          <h1>Profil Utilisateur</h1>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <div className="info-content">
              <label>Nom d'utilisateur</label>
              <div className="info-value">
                <p><b>{userInfo?.username}</b></p>
              </div>
            </div>
          </div>

          <div className="info-group">
            <div className="info-content">
              <label>Nom</label>
              <div className="info-value">
                <p><b>{userInfo?.nom}</b></p>
              </div>
            </div>
          </div>

          <div className="info-group">
            <div className="info-content">
              <label>Prénom</label>
              <div className="info-value">
                <p><b>{userInfo?.prenom}</b></p>
              </div>
            </div>
          </div>

          <div className="info-group">
            <div className="info-icon">
              <Mail size={20} />
            </div>
            <div className="info-content">
              <label>Email</label>
              <div className="info-value">
                <p><b>{userInfo?.email}</b></p>
              </div>
            </div>
          </div>

          <div className="info-group">
            <div className="info-icon">
              <Phone size={20} />
            </div>
            <div className="info-content">
              <label>Téléphone</label>
              <div className="info-value">
                <p><b>{userInfo?.telephone}</b></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;