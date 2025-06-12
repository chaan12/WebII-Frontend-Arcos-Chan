import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/pages/EliminarAlumnos.css";

export default function EliminarAlumnos() {
  const [searchMatricula, setSearchMatricula] = useState("");
  const [alumno, setAlumno] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!searchMatricula.trim()) {
      setError("Ingresa una matrícula para buscar.");
      return;
    }
    setError("");
    setLoadingSearch(true);
    setAlumno(null);
    try {
      const resp = await axios.get("/api/alumno/");
      if (resp.data.status === "ok" && Array.isArray(resp.data.alumnos)) {
        const found = resp.data.alumnos.find(
          (a) => String(a.matricula).trim() === searchMatricula.trim()
        );
        if (found) {
          setAlumno(found);
        } else {
          setError("Alumno no encontrado.");
        }
      } else {
        setError("Error al obtener lista de alumnos.");
      }
    } catch (err) {
      setError("Error al buscar alumno.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleEliminar = async () => {
    if (!alumno) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
      return;
    }
    setLoadingDelete(true);
    try {
      const resp = await axios.delete(`/api/alumno/${alumno.id_alumno}`);
      if (resp.data.status === "ok") {
        alert("Alumno eliminado correctamente.");
        navigate("/admin/alumnos");
      } else {
        setError(resp.data.mensaje || "Error al eliminar alumno.");
      }
    } catch (err) {
      setError("Error al comunicar con el servidor.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="eliminar-alumnos-container">
      <div className="card eliminar-card">
        <div className="card-header">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            &larr; Volver
          </button>
          <h1>Eliminar Alumno</h1>
        </div>
        <div className="card-body">
          {!alumno ? (
            <>
              {error && <p className="error">{error}</p>}
              <form className="search-form" onSubmit={handleBuscar}>
                <div className="form-group search-group">
                  <input
                    type="text"
                    placeholder="Matrícula"
                    value={searchMatricula}
                    onChange={(e) => setSearchMatricula(e.target.value)}
                  />
                  <button type="submit" disabled={loadingSearch}>
                    {loadingSearch ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="alumno-info">
                <p>
                  <strong>Nombre:</strong> {alumno.nombre} {alumno.apellido_pat}{" "}
                  {alumno.apellido_mat}
                </p>
                <p>
                  <strong>Matrícula:</strong> {alumno.matricula}
                </p>
              </div>
              {error && <p className="error">{error}</p>}
              <button
                className="btn-eliminar"
                onClick={handleEliminar}
                disabled={loadingDelete}
              >
                {loadingDelete ? "Eliminando..." : "Confirmar Eliminación"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
