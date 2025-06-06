import React, { useState } from "react";
import "../styles/components/SchoolCard.css";

export default function SchoolCard({ title, color, programs = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="school-card">
      <div className="card-content">
        <p>Escuela de</p>
        <h3>{title}</h3>
      </div>
      <button
        className="card-button"
        style={{ backgroundColor: color }}
        onClick={toggleMenu}
      >
        Ver oferta <span>{isOpen ? "⬆" : "⬇"}</span>
      </button>
      {isOpen && (
        <ul className="program-list">
          {programs.map((program, index) => (
            <li key={index}>
              <span className="dot" style={{ backgroundColor: color }}></span>
              {program}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
