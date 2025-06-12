import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginAlumno.css";
import fondo from "../img/fondo.png";
import logo from "../img/logo.png";
import axios from "axios";

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
      const response = await axios.post("/api/administrador/login", {
        matricula: matricula.trim(),
        password: password
      });
      const result = response.data;
      if (result.status === "ok" && result.administrador) {
        localStorage.setItem("adminMatricula", result.administrador.matricula);
        navigate("/home-admin");
      } else {
        alert("Matrícula o contraseña incorrecta.");
      }
    } catch (error) {
      alert("Datos Incorrectos");
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
          ADMIN <br /> PORTAL
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
