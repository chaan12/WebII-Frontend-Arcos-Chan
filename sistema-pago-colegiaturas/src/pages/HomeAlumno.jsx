
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/pages/HomeAlumno.css";
import logoNombre from "../img/logo-nombre.svg";

export default function HomeAlumno() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alumno, setAlumno] = useState(null);

  useEffect(() => {
    if (location.state && location.state.alumno) {
      setAlumno(location.state.alumno);
      localStorage.setItem("matricula", location.state.alumno.matricula);
      return;
    }

    const matricula = localStorage.getItem("matricula");
    if (!matricula) {
      navigate("/alumnos");
      return;
    }

    const fetchAlumno = async () => {
      try {
        const resp = await fetch(
          `http://34.195.71.215:8000/alumno/?matricula=${matricula}`
        );
        const data = await resp.json();
        if (
          data.status !== "ok" ||
          !Array.isArray(data.alumnos) ||
          data.alumnos.length === 0
        ) {
          localStorage.removeItem("matricula");
          navigate("/alumnos");
          return;
        }
        const found = data.alumnos[0];
        setAlumno(found);
      } catch (err) {
        console.error("Error al obtener datos del alumno:", err);
        localStorage.removeItem("matricula");
        navigate("/alumnos");
      }
    };

    fetchAlumno();
  }, [location.state, navigate]);

  return (
    <div className="home-alumno">
      <Sidebar />

      <main className="main-content">
        <div className="top-banner">
          <img src={logoNombre} alt="Logo" className="banner-logo" />
        </div>

        {alumno ? (
          <div className="profile-card">
            <div className="profile-banner"></div>
            <div className="profile-info">
              <img
                src={
                  alumno.foto
                    ? alumno.foto.startsWith("http")
                      ? alumno.foto
                      : `http://34.195.71.215:8000${alumno.foto}`
                    : ""
                }
                alt="Foto de perfil"
                className="profile-avatar"
              />
              <div className="profile-details">
                <h2>
                  {`${alumno.nombre} ${alumno.apellido_pat} ${alumno.apellido_mat}`}
                </h2>
                <p>Matrícula: {alumno.matricula}</p>
                <p>Carrera: {alumno.carrera}</p>
                <p>Semestre: {alumno.semestre}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="loading-text">Cargando datos del alumno…</p>
        )}
      </main>
    </div>
  );
}
