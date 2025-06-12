import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button className="burger" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <div className="sidebar-header">
          <h2>Alumno</h2>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/libreta-pago")}>Libreta de Pago</li>
          <li onClick={() => navigate("/realizar-pago")}>Realizar Pago</li>
          <li onClick={() => navigate("/mi-cuenta")}>Mi Cuenta</li>
          <li
            onClick={() => {
              localStorage.clear();
              navigate("/alumnos");
            }}
          >
            Cerrar Sesión
          </li>
        </ul>
      </aside>
    </>
  );
}