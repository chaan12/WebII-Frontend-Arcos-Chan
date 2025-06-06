import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pages/GestionAlumnos.css";
import logoNombre from "../img/logo-nombre.svg";

export default function GestionAlumnos() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellidoPat, setApellidoPat] = useState("");
  const [apellidoMat, setApellidoMat] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [idCarrera, setIdCarrera] = useState("");
  const [semestresDisponibles, setSemestresDisponibles] = useState([]);
  const [semestre, setSemestre] = useState("");
  const [becas, setBecas] = useState([]);
  const [idBeca, setIdBeca] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const resp = await axios.get("/api/carrera/");
        if (resp.data.status === "ok") {
          setCarreras(resp.data.carreras);
        }
      } catch (err) {
        console.error("Error fetching carreras:", err);
      }
    };

    const fetchBecas = async () => {
      try {
        const resp = await axios.get("/api/beca/");
        if (resp.data.status === "ok") {
          setBecas(resp.data.becas);
        }
      } catch (err) {
        console.error("Error fetching becas:", err);
      }
    };

    fetchCarreras();
    fetchBecas();
  }, []);

  useEffect(() => {
    if (idCarrera) {
      const carreraObj = carreras.find((c) => c.id_carrera === Number(idCarrera));
      if (carreraObj && Array.isArray(carreraObj.semestres)) {
        setSemestresDisponibles(carreraObj.semestres);
        setSemestre("");
      } else {
        setSemestresDisponibles([]);
        setSemestre("");
      }
    } else {
      setSemestresDisponibles([]);
      setSemestre("");
    }
  }, [idCarrera, carreras]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!nombre.trim() || !apellidoPat.trim() || !apellidoMat.trim()) {
      setErrorMessage("Todos los campos de nombre y apellidos son obligatorios.");
      return;
    }

    if (!idCarrera) {
      setErrorMessage("Debes seleccionar una carrera.");
      return;
    }

    if (!semestre) {
      setErrorMessage("Debes seleccionar un semestre válido.");
      return;
    }

    const semestreNum = Number(semestre);
    if (Number.isNaN(semestreNum) || semestreNum < 1 || semestreNum > 8) {
      setErrorMessage("El semestre debe estar entre 1 y 8.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("apellido_pat", apellidoPat.trim());
    formData.append("apellido_mat", apellidoMat.trim());
    formData.append("id_carrera", idCarrera);
    formData.append("semestre", semestre);

    if (idBeca) {
      formData.append("id_beca", idBeca);
    }

    if (fotoFile) {
      formData.append("foto", fotoFile);
    }

    try {
      const resp = await axios.post("/api/alumno/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.data.status === "ok") {
        navigate("/admin/alumnos");
      } else {
        setErrorMessage(resp.data.mensaje || "Error desconocido al crear alumno.");
      }
    } catch (err) {
      console.error("Error al crear alumno:", err);
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data.mensaje || "Error en el servidor al crear alumno.");
      } else {
        setErrorMessage("Error de red al crear alumno.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gestion-alumnos-page">
      <header className="top-banner-gestion">
        <img src={logoNombre} alt="Logo Universidad" className="banner-logo-gestion" />
        <h1 className="banner-title-gestion">Universidad Modelo</h1>
      </header>

      <div className="gestion-alumnos-container">
        <h2 className="form-title">Agregar Nuevo Alumno</h2>

        {errorMessage && (
          <div className="form-error-message">{errorMessage}</div>
        )}

        <form className="form-alumno" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido_pat">Apellido Paterno:</label>
            <input
              type="text"
              id="apellido_pat"
              value={apellidoPat}
              onChange={(e) => setApellidoPat(e.target.value)}
              placeholder="Apellido Paterno"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido_mat">Apellido Materno:</label>
            <input
              type="text"
              id="apellido_mat"
              value={apellidoMat}
              onChange={(e) => setApellidoMat(e.target.value)}
              placeholder="Apellido Materno"
            />
          </div>

          <div className="form-group">
            <label htmlFor="id_carrera">Carrera:</label>
            <select
              id="id_carrera"
              value={idCarrera}
              onChange={(e) => setIdCarrera(e.target.value)}
            >
              <option value="">Selecciona una carrera</option>
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semestre">Semestre:</label>
            <select
              id="semestre"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
            >
              <option value="">Selecciona semestre</option>
              {semestresDisponibles.map((s) => (
                <option key={s.id_carrera_semestre} value={s.numero}>
                  {s.numero}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="id_beca">Beca (opcional):</label>
            <select
              id="id_beca"
              value={idBeca}
              onChange={(e) => setIdBeca(e.target.value)}
            >
              <option value="">Sin beca</option>
              {becas.map((b) => (
                <option key={b.id_beca} value={b.id_beca}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="foto">Foto (opcional):</label>
            <input
              type="file"
              id="foto"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files[0] || null)}
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Alumno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}