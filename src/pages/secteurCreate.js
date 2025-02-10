import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    useTheme, 
    TextField, 
    MenuItem,
    IconButton, 
    Tooltip 
  } from '@mui/material';
import { Formik } from "formik";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import { apiAccount, apiFruit } from '../api';
import * as yup from 'yup'

const AssignSector = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // const colors = tokens(theme.palette.mode);
    // const theme = useTheme();
    const theme = useTheme(); 
    const colors = tokens(theme.palette.mode);


    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);

            if (storedUser.role !== "ADMIN") {
                setError("Accès refusé. Seuls les administrateurs peuvent ajouter un utilisateur.");
            }
        } else {
            setError("Erreur d'authentification. Veuillez vous reconnecter.");
        }
    }, []);

    const handleFormSubmit = async (values) => {
        setMessage("");
        setError("");
        setLoading(true);

        if (!token) {
            setError("Erreur d'authentification. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            const response = await apiFruit.post("/secteurs/create/", values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setMessage("Secteur ajouté avec succès !");
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Erreur lors de l'ajout du secteur.");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }


    return (
        <Box m="20px">
             {/* En-tête avec bouton retour */}
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
          title="Ajouter un secteur" 
          subtitle="Formulaire pour assigner un secteur a un utilisateur" 
        />
      </Box>
            <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={userSchema}
            >
                {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, minmax(0, 1fr))">
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Nom du secteur"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.nom}
                                name="nom"
                                error={!!touched.nom && !!errors.nom}
                                helperText={touched.nom && errors.nom}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Nom de l'utilisateur en charge"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.username}
                                name="username"
                                error={!!touched.username && !!errors.username}
                                helperText={touched.username && errors.username}
                                sx={{ gridColumn: "span 2" }}
                            />
                        </Box>
                        <Box display="flex" justifyContent="end" mt="20px">
                            <Button type="submit" color="secondary" variant="contained" disabled={loading}>
                                {loading ? "Ajout en cours..." : "Ajouter secteur"}
                            </Button>
                        </Box>
                        {message && <p style={{ color: "green" }}>{message}</p>}
                    </form>
                )}
            </Formik>
        </Box>
    );
};

const userSchema = yup.object().shape({
    nom: yup.string().required("Le nom du secteur est requis"),
    username: yup.string().required("Le nom d'utilsateur est requis"),
    });

const initialValues = {
    nom: "",
    username: "",
};

export default AssignSector;