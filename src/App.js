import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import Login from "./pages/Login";
import LoginUser from "./pages/Login_User";
import Dashboard from "./pages/Dashboard";
import DashboardUser from "./pages/Dashboard_User";
import PrivateRoute from "./components/PrivateRoute";
import { Navigate } from 'react-router-dom';
import Register from "./pages/Register";
import RapportPage from "./pages/Rapport";
import Rapport_check from "./pages/Rapport_check";
import StatistiquesRecolte from "./pages/StatsRecolte";
// import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import UsersList from "./pages/listUsers";
import AddUserForm from "./pages/addUser";
import AssignSector from "./pages/secteurCreate";
import SectorList from "./pages/List_Secteur";
// import UserProfile from "./pages/UserProfil";
// import EditPassword from "./pages/EditePass";
// import EditProfile from "./pages/EditProfil";
import UserProfile from "./pages/UserProfil";
import EditPassword from "./pages/EditePass";
import EditProfile from "./pages/EditProfil";
import EditProfileA from "./pages/EditProfilA";
import EditPasswordA from "./pages/EditePassA";


function App() {
    const [theme, colorMode] = useMode(); // Gestion du thème
    return (
        // <ColorModeContext.Provider value={colorMode}>
    //   <ThemeProvider theme={theme}>
        // <CssBaseline />
        <AuthProvider>
            <Router>
                <Routes>
                    {/* <Route path="/login" element={<Login />} /> */}
                    <Route path="/loginUser" element={<LoginUser />} />
                    {/* <Route path="/register" element={<Register />} /> */}
                    
                    {/* Routes protégées */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboardU" element={<DashboardUser />} />
                        <Route path="/rapport" element={<RapportPage />} />
                        <Route path="/rapport-list" element={<Rapport_check />} />
                        <Route path="/statistiques" element={<StatistiquesRecolte />} />
                        <Route path="/users-list" element={<UsersList />} />
                        <Route path="/add-user" element={<AddUserForm />} />
                        <Route path="/assigner-secteur" element={<AssignSector />} />
                        <Route path="/sector-list" element={<SectorList />} />
                        <Route path="/profil" element={<UserProfile />} />
                        <Route path="/edit-password" element={<EditPassword />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/edit-profileA" element={<EditProfileA />} />
                        <Route path="/edit-passwordA" element={<EditPasswordA />} />
                        
                    </Route>

                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/loginUser" />} />
                </Routes>
            </Router>
        </AuthProvider>
        // </ThemeProvider>
    // </ColorModeContext.Provider>

    );
}

export default App;
