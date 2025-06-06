import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/pages/VerAlumnos.css";
import { useNavigate } from "react-router-dom";

export default function VerAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchNombre, setSearchNombre] = useState("");
  const [searchApellidoPat, setSearchApellidoPat] = useState("");
  const [searchApellidoMat, setSearchApellidoMat] = useState("");
  const [searchMatricula, setSearchMatricula] = useState("");

  useEffect(() => {
    const fetchAlumnos = async () => {
      setLoading(true);
      setError("");
      try {
        const respBecas = await axios.get("/api/beca/");
        let mapaBecas = {};
        if (
          respBecas.data.status === "ok" &&
          Array.isArray(respBecas.data.becas)
        ) {
          respBecas.data.becas.forEach((beca) => {
            mapaBecas[beca.id_beca] = beca.nombre;
          });
        }

        const resp = await axios.get("/api/alumno/");
        if (resp.data.status === "ok" && Array.isArray(resp.data.alumnos)) {
          const alumnosConBeca = resp.data.alumnos.map((alu) => {
            const nombreBeca =
              alu.id_beca && mapaBecas[alu.id_beca]
                ? mapaBecas[alu.id_beca]
                : "Sin beca";
            return {
              ...alu,
              becaNombre: nombreBeca,
            };
          });
          setAlumnos(alumnosConBeca);
        } else {
          setError("No se encontraron alumnos.");
        }
      } catch (err) {
        console.error("Error al obtener lista de alumnos:", err);
        setError("Error cargando datos de alumnos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, []);

  const alumnosFiltrados = alumnos.filter((alu) => {
    const nombreMatch = alu.nombre
      .toLowerCase()
      .includes(searchNombre.trim().toLowerCase());
    const paternoMatch = alu.apellido_pat
      .toLowerCase()
      .includes(searchApellidoPat.trim().toLowerCase());
    const maternoMatch = alu.apellido_mat
      .toLowerCase()
      .includes(searchApellidoMat.trim().toLowerCase());
    const matriculaMatch = alu.matricula
      .toString()
      .includes(searchMatricula.trim());
    return (
      nombreMatch &&
      paternoMatch &&
      maternoMatch &&
      matriculaMatch
    );
  });

  return (
    <div className="ver-alumnos-container">
      <h1>Listado de Alumnos</h1>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar por Nombre"
          value={searchNombre}
          onChange={(e) => setSearchNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por Apellido Paterno"
          value={searchApellidoPat}
          onChange={(e) => setSearchApellidoPat(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por Apellido Materno"
          value={searchApellidoMat}
          onChange={(e) => setSearchApellidoMat(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por Matrícula"
          value={searchMatricula}
          onChange={(e) => setSearchMatricula(e.target.value)}
        />
      </div>
      {loading && <p>Cargando alumnos...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          {alumnosFiltrados.length > 0 ? (
            <table className="tabla-alumnos">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nombre</th>
                  <th>Carrera</th>
                  <th>Semestre</th>
                  <th>Beca</th>
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.map((alu) => (
                  <tr key={alu.id_alumno}>
                    <td>{alu.matricula}</td>
                    <td>
                      {alu.nombre} {alu.apellido_pat} {alu.apellido_mat}
                    </td>
                    <td>{alu.carrera || "—"}</td>
                    <td>{alu.semestre || "—"}</td>
                    <td>{alu.becaNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sin-alumnos">No se encontraron alumnos.</p>
          )}
        </>
      )}
      <button className="btn-volver" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
}