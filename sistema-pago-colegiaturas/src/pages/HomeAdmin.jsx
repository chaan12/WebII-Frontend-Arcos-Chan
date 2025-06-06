import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/HomeAdmin.css";
import logoModelo from "../img/logo-nombre.svg";

export default function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div className="home-admin">
      <header className="top-banner-admin">
        <img
          src={logoModelo}
          alt="Universidad Modelo Logo"
          className="banner-logo-admin"
        />
      </header>
      <div className="welcome-text-admin">
        <h1>Bienvenido, Administrador</h1>
      </div>

      <main className="main-content-admin">
        <div className="admin-options">
          <button onClick={() => navigate("/admin/gestionar-alumnos")}>
            Gestionar Alumnos
          </button>
          <button onClick={() => navigate("/admin/alumnos")}>
            Ver Todos los Alumnos
          </button>
          <button onClick={() => navigate("/admin/pagos")}>
            Gestionar Pagos
          </button>
        </div>

        <div className="admin-logout-container">
          <button
            className="logout-admin"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}
