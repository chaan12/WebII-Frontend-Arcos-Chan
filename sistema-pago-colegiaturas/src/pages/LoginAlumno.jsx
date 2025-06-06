import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginAlumno.css";
import fondo from "../img/fondo.png";
import logo from "../img/logo.png";

export default function LoginAlumno() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!matricula || !password) {
      alert("Por favor completa ambos campos.");
      return;
    }

    try {
      const response = await fetch("/api/alumno/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, password }),
      });
      const result = await response.json();
      if (result.status === "ok" && result.alumno) {
        const alumno = result.alumno;
        console.log("Usuario autenticado:", alumno);
        localStorage.setItem("matricula", alumno.matricula);
        navigate("/home-alumno", { state: { alumno } });
      } else {
        alert("Matrícula o contraseña incorrecta.");
      }
    } catch (error) {
      console.error("Error al conectar con la API de login", error);
      alert("Ocurrió un error. Intenta más tarde.");
    }
  };

  return (
    <div className="login-alumno" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="login-box">
        {/* Botón secundario para volver al index */}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/")}
        >
          Volver a Inicio
        </button>

        <img src={logo} alt="Logo Escuela Modelo" className="logo" />
        <h2>
          SERVICIOS <br /> ESCOLARES
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
