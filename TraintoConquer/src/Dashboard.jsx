// src/Dashboard.js
import React from 'react';
import './Dashboard.css'; // Asegúrate de crear este archivo CSS para los estilos


const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Admin Dashboard</h2>
                <ul>
                    <li><a href="#players" className="nav-link">Jugadores</a></li>
                    <li><a href="#sales" className="nav-link">Ventas</a></li>
                    <li><a href="#settings" className="nav-link">Configuración</a></li>
                </ul>
            </div>
            <div className="main-content">
                <h1>Bienvenido al Dashboard</h1>
                <div className="section" id="players">
                    <h2>Jugadores</h2>
                    <p>Lista de jugadores activos...</p>
                </div>
                <div className="section" id="sales">
                    <h2>Ventas</h2>
                    <p>Información sobre las ventas...</p>
                </div>
                <div className="section" id="settings">
                    <h2>Configuración</h2>
                    <p>Ajustes del juego...</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
