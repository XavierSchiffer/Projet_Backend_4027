import { useState, useEffect } from "react";
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
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiAccount } from "../api";
import { tokens } from '../theme';
import React from "react";

const AddUserForm = () => {
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
            const response = await apiAccount.post("/admin/registration/users", values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setMessage("Utilisateur ajouté avec succès !");
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur.");
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
          title="Ajouter un utilisateur" 
          subtitle="Formulaire pour ajouter un utilisateur" 
        />
      </Box>
            {/* <Header title="Ajouter un utilisateur" subtitle="Formulaire pour ajouter un utilisateur" /> */}
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
                                label="Nom"
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
                                label="Prénom"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.prenom}
                                name="prenom"
                                error={!!touched.prenom && !!errors.prenom}
                                helperText={touched.prenom && errors.prenom}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="email"
                                label="Email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                name="email"
                                error={!!touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Téléphone"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.telephone}
                                name="telephone"
                                error={!!touched.telephone && !!errors.telephone}
                                helperText={touched.telephone && errors.telephone}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                select
                                variant="filled"
                                label="Rôle"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.role}
                                name="role"
                                error={!!touched.role && !!errors.role}
                                helperText={touched.role && errors.role}
                                sx={{ gridColumn: "span 4" }}
                            >
                                <MenuItem value="GESTIONNAIRE">GESTIONNAIRE</MenuItem>
                                <MenuItem value="AGRICULTEUR">AGRICULTEUR</MenuItem>
                            </TextField>
                        </Box>
                        <Box display="flex" justifyContent="end" mt="20px">
                            <Button type="submit" color="secondary" variant="contained" disabled={loading}>
                                {loading ? "Ajout en cours..." : "Ajouter utilisateur"}
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
    nom: yup.string().required("Le nom est requis"),
    prenom: yup.string().required("Le prénom est requis"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    telephone: yup.string().required("Le téléphone est requis"),
    role: yup.string().oneOf(["GESTIONNAIRE", "AGRICULTEUR"], "Rôle invalide").required("Le rôle est requis"),
});

const initialValues = {
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "GESTIONNAIRE",
};

export default AddUserForm;
