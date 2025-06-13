import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pages/EditarAlumnos.css";

export default function EditarAlumnos() {
  const [searchMatricula, setSearchMatricula] = useState("");
  const [alumnoId, setAlumnoId] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    nombre: "",
    apellido_pat: "",
    apellido_mat: "",
    matricula: "",
  });
  const [error, setError] = useState("");

  const [carreras, setCarreras] = useState([]);
  const [idCarrera, setIdCarrera] = useState(null);
  const [semestresDisponibles, setSemestresDisponibles] = useState([]);
  const [semestre, setSemestre] = useState("");

  useEffect(() => {
    axios.get("/api/carrera/")
      .then(resp => {
        if (resp.data.status === "ok") setCarreras(resp.data.carreras);
      })
      .catch(err => console.error("Error fetching carreras:", err));
  }, []);

  useEffect(() => {
    const carreraObj = carreras.find(c => c.id_carrera === idCarrera);
    if (carreraObj && Array.isArray(carreraObj.semestres)) {
      setSemestresDisponibles(carreraObj.semestres);
      if(!carreraObj.semestres.some(s => String(s.numero) === String(semestre))) {
        setSemestre("");
      }
    } else {
      setSemestresDisponibles([]);
    }
  }, [idCarrera, carreras]);

  const handleBuscar = async () => {
    if (!searchMatricula.trim()) {
      setError("Ingresa una matrícula para buscar.");
      return;
    }
    setError("");
    setLoadingSearch(true);
    try {
      const resp = await axios.get("/api/alumno/");
      if (
        resp.data.status === "ok" &&
        Array.isArray(resp.data.alumnos)
      ) {
        const found = resp.data.alumnos.find(
          (a) => String(a.matricula).trim() === searchMatricula.trim()
        );
        if (found) {
          setAlumnoId(found.id_alumno);
          setFormValues({
            nombre: found.nombre,
            apellido_pat: found.apellido_pat,
            apellido_mat: found.apellido_mat,
            matricula: found.matricula,
          });
          setIdCarrera(Number(found.id_carrera));
          const carreraObj = carreras.find(c => c.semestres.some(s => s.id_carrera_semestre === found.carrera_semestre));
          if (carreraObj) {
            setIdCarrera(carreraObj.id_carrera);
            const semestreNum = carreraObj.semestres.find(s => s.id_carrera_semestre === found.carrera_semestre)?.numero;
            setSemestre(semestreNum || "");
          }
          setError("");
        } else {
          setError("Alumno no encontrado");
        }
      } else {
        setError("Error al obtener lista de alumnos");
      }
    } catch (err) {
      setError("Error al buscar alumno");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const resp = await fetch(`/api/alumno/${alumnoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          id_carrera: Number(idCarrera),
          semestre: Number(semestre)
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.mensaje || "Error al guardar cambios");
      }
      alert("Alumno actualizado correctamente");
      navigate("/admin/alumnos");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="editar-alumno-container">
      {alumnoId === null ? (
        <div className="card">
          <div className="card-header">
            <button
              type="button"
              className="btn-volver"
              onClick={() => navigate(-1)}
            >
              &larr; Volver
            </button>
            <h1>Buscar Alumno</h1>
          </div>
          <div className="card-body">
            {error && <p className="error">{error}</p>}
            <form
              className="search-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleBuscar();
              }}
            >
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
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <button
              type="button"
              className="btn-volver"
              onClick={() => navigate(-1)}
            >
              &larr; Volver
            </button>
            <h1>Editar Alumno</h1>
          </div>
          <div className="card-body">
            {error && <p className="error">{error}</p>}
            <form className="editar-alumno-form" onSubmit={handleSubmit}>
              {/* form groups unchanged */}
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formValues.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido_pat">Apellido Paterno</label>
                <input
                  id="apellido_pat"
                  name="apellido_pat"
                  type="text"
                  value={formValues.apellido_pat}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido_mat">Apellido Materno</label>
                <input
                  id="apellido_mat"
                  name="apellido_mat"
                  type="text"
                  value={formValues.apellido_mat}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="matricula">Matrícula</label>
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  value={formValues.matricula}
                  disabled
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn-guardar">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
