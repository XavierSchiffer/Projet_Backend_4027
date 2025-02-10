import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarExport, 
  GridToolbarFilterButton 
} from '@mui/x-data-grid';
import { 
  ArrowBackIosNew as BackIcon, 
  RefreshOutlined as RefreshIcon, 
  FilterListOutlined as FilterIcon, 
  CloudDownloadOutlined as ExportIcon,
  VisibilityOutlined as ViewIcon,
  DeleteOutlined as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { tokens } from '../theme';
import { apiFruit } from '../api';

const SectorList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Récupérer le token stocké

  // États pour stocker les utilisateurs et les colonnes
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Définition des colonnes
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90 
    },
    { 
      field: 'username', 
      headerName: 'Nom d\'utilisateur', 
      flex: 1 
    },
    { 
      field: 'nom', 
      headerName: 'Nom du secteur', 
      flex: 1 
    }
  ];

  // Charger les secteurs
  useEffect(() => {
      // Fonction pour récupérer les secteurs
  const fetchUsers = async () => {
    try {
      const response = await apiFruit.get("/secteurs/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Récupération correcte des secteurs
      const usersData = response.data?.[0]?.results?.[0] || []; 
  
      setUsers(usersData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs :", error);
    } finally {
      setLoading(false);
    }
  };

    fetchUsers();
  }, []);

  // Gestionnaires d'actions
  const handleViewUser = (user) => {
    navigate(`/user-details/${user.id}`);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiFruit.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  // Fonction personnalisée pour la barre d'outils
  function CustomToolbar() {
    return (
      <GridToolbarContainer 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1 
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <GridToolbarFilterButton startIcon={<FilterIcon />} />
          <GridToolbarExport 
            startIcon={<ExportIcon />} 
            printOptions={{ disableToolbarButton: true }}
          />
        </Box>
        <Tooltip title="Actualiser les données">
          <IconButton onClick={() => {/* Logique de rafraîchissement */}}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </GridToolbarContainer>
    );
  }

  return (
    <Box m="20px">
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={2}
      >
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
        <Header 
          title="SECTEURS" 
          subtitle="Gestion des secteurs du système" 
        />
      </Box>

      <Box
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { 
            border: "none", 
            borderRadius: 3 
          },
          "& .MuiDataGrid-cell": { 
            borderBottom: "none" 
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          },
          "& .MuiDataGrid-virtualScroller": { 
            backgroundColor: colors.primary[400] 
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          },
          "& .MuiCheckbox-root": { 
            color: `${colors.greenAccent[200]} !important` 
          },
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: colors.primary[500],
            borderRadius: 2,
            p: 1,
          }
        }}
      >
        <DataGrid 
          checkboxSelection 
          rows={users} 
          columns={columns} 
          getRowId={(row) => row.id}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: colors.blueAccent[500],
                transition: 'background-color 0.3s ease',
              }
            }
          }}
          initialState={{
            pagination: { 
              paginationModel: { pageSize: 10 } 
            },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Box>
    </Box>
  );
};

export default SectorList;