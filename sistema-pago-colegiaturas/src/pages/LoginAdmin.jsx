import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginAlumno.css";
import fondo from "../img/fondo.png";
import logo from "../img/logo.png";

export default function LoginAdmin() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!matricula || !password) {
      alert("Por favor completa ambos campos.");
      return;
    }
    try {
      const response = await fetch("/api/administrador/?matricula=" + matricula + "&password=" + password);
      const data = await response.json();
      if (data.status === "ok" && data.administradores.length > 0) {
        localStorage.setItem("adminLoggedIn", "true");
        navigate("/home-admin");
      } else {
        alert("Matrícula o contraseña incorrecta");
      }
    } catch (error) {
      console.error("Error al conectar con la API", error);
      alert("Ocurrió un error. Intenta más tarde.");
    }
  };

  return (
    <div className="login-alumno" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="login-box">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/")}
        >
          Volver a Inicio
        </button>

        <img src={logo} alt="Logo Escuela Modelo" className="logo" />
        <h2>
          SOLO <br /> ADMINISTRADORES
        </h2>

        <div className="input-group">
          <span className="icon">👤</span>
          <input
            type="text"
            id="matricula"
            placeholder=" "
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
          <label htmlFor="matricula">Matrícula</label>
        </div>

        <div className="input-group">
          <span className="icon">🔒</span>
          <input
            type="password"
            id="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Contraseña</label>
        </div>

        <button className="btn-login" onClick={handleLogin}>
          ENTRAR
        </button>
      </div>
    </div>
  );
}
