import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Index.css";
import SchoolCard from "../components/SchoolCard";
import alumnosIpad from "../img/personas.png";
import modeloDiferente from "../img/modelo-diferente.png";
import logoNombre from "../img/logo-nombre.svg";

export default function Index() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      className="index-page"
      onClick={() => {
        if (showMenu) setShowMenu(false);
      }}
    >
      <div className="index-banner" onClick={(e) => e.stopPropagation()}>
        <img src={logoNombre} alt="Logo Universidad" />
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
      </div>
      {showMenu && (
        <div
          className="index-menu"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h3>Menú:</h3>
          <hr />
          <ul>
            <li onClick={() => navigate("/admin")}>Administrador</li>
            <li onClick={() => navigate("/alumnos")}>Alumnos</li>
          </ul>
        </div>
      )}

      <div className="index-section-1">
        <div className="text-content">
          <h1>¡Te damos la bienvenida!</h1>
          <p>
            Estás en el sitio oficial de la Universidad Modelo. Nuestra
            institución está conformada por tres campus. Para una mejor
            experiencia de navegación, elige el campus de tu interés.
          </p>
        </div>
        <div className="image-content">
          <img src={modeloDiferente} alt="Un modelo diferente de universidad" />
        </div>
      </div>
      <div className="section-divider"></div>
      <div className="index-section-2">
        <div className="licenciaturas-text">
          <h2>
            <span>Conoce nuestras</span>
            <br />
            <strong>Licenciaturas</strong>
          </h2>
          <button className="btn-campus-outline">Campus Mérida</button>
        </div>
        <div className="licenciaturas-img">
          <img src={alumnosIpad} alt="Alumnos usando tablet" />
        </div>
      </div>
      <div className="section-divider"></div>
      <div className="index-section-3">
        <SchoolCard title="Arquitectura" color="#4CAF50" programs={["Arquitectura", "Ingeniería Arquitectónica"]} />
        <SchoolCard title="Derecho" color="#C2185B" programs={["Derecho", "Relaciones internacionales y Alianzas Estratégicas"]} />
        <SchoolCard title="Diseño" color="#E91E63" programs={["Bioconstrucción y Diseño Sustentable", "Diseño Interactivo", "Diseño de Moda", "Diseño e Innovación"]} />
        <SchoolCard title="Humanidades" color="#FFC107" programs={["Comunicación", "Lengua y Literatura Modernas", "Producción Musical"]} />
        <SchoolCard title="Ingeniería" color="#0D47A1" programs={[
          "Ingeniería Automotriz",
          "Ingeniería Biomédica",
          "Ingeniería Industrial Logística",
          "Ingeniería Mecatrónica",
          "Ingeniería en Desarrollo de Tecnología y Software",
          "Ingeniería en Energía y Petróleo"
        ]} />
        <SchoolCard title="Negocios" color="#6A1B9A" programs={[
          "Administración y Dirección Financiera",
          "Administración y Mercadotecnia Estratégica",
          "Dirección Estratégica de Negocios",
          "Dirección de Empresas y Negocios Internacionales"
        ]} />
        <SchoolCard title="Salud" color="#1976D2" programs={[
          "Atención Primaria de la Salud",
          "Ciencias Aplicadas al Deporte",
          "Cirujano Dentista",
          "Fisioterapia y Rehabilitación",
          "Nutrición",
          "Psicología"
        ]} />
      </div>
    </div>
  );
}
