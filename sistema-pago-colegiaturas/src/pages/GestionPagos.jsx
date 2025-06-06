import React, { useState } from "react";
import axios from "axios";
import "../styles/pages/GestionPagos.css";

export default function GestionPagos() {
  const conceptosMap = {
    1: "Colegiatura",
    2: "Inscripción",
  };

  const [matriculaInput, setMatriculaInput] = useState("");
  const [alumno, setAlumno] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuscarAlumno = async () => {
    const matriculaTrim = matriculaInput.trim();
    if (!matriculaTrim) {
      setError("Por favor ingresa una matrícula.");
      return;
    }

    setError("");
    setLoading(true);
    setAlumno(null);
    setPagos([]);

    try {
      const respAlumno = await axios.get(
        `/api/alumno/?matricula=${encodeURIComponent(matriculaTrim)}`
      );

      console.log("respAlumno.data.alumnos:", respAlumno.data.alumnos);

      if (
        respAlumno.data.status !== "ok" ||
        !Array.isArray(respAlumno.data.alumnos) ||
        respAlumno.data.alumnos.length === 0
      ) {
        setError("No se encontró ningún alumno con esa matrícula.");
        setLoading(false);
        return;
      }

      const found = respAlumno.data.alumnos.find(
        (a) => String(a.matricula) === matriculaTrim
      );

      if (!found) {
        setError("No se encontró ningún alumno con esa matrícula.");
        setLoading(false);
        return;
      }

      setAlumno(found);

      try {
        const respPagos = await axios.get(
          `/api/pago/alumno/${found.id_alumno}`
        );
          
        if (
          respPagos.data.status === "ok" &&
          Array.isArray(respPagos.data.pagos)
        ) {
          setPagos(respPagos.data.pagos);
        } else {
          setPagos([]);
        }
      } catch (errPagos) {
          
        setPagos([]);
      }
    } catch (err) {
      console.error("Error al buscar alumno o cargar pagos:", err);
      setError("Ocurrió un error al conectar con la API. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestion-pagos-container">
      <button
        className="btn-volver"
        onClick={() => window.history.back()}
      >
        Volver
      </button>
      <h1>Gestión de Pagos</h1>

      <div className="buscador-alumno">
        <label htmlFor="matricula">Buscar por Matrícula:</label>
        <input
          type="text"
          id="matricula"
          value={matriculaInput}
          onChange={(e) => setMatriculaInput(e.target.value)}
          placeholder="Ej. 15221403"
        />
        <button onClick={handleBuscarAlumno} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {alumno && !loading && (
        <div className="alumno-info">
          <h2>Alumno Encontrado:</h2>
          <p>
            <strong>Nombre:</strong> {alumno.nombre} {alumno.apellido_pat}{" "}
            {alumno.apellido_mat}
          </p>
          <p>
            <strong>Matrícula:</strong> {alumno.matricula}
          </p>
          <p>
            <strong>Carrera:</strong> {alumno.carrera || "—"}
          </p>
          <p>
            <strong>Semestre:</strong> {alumno.semestre || "—"}
          </p>
        </div>
      )}

      {alumno && !loading && (
        <div className="tabla-pagos-container">
          <h2>Pagos Realizados</h2>
          {pagos.length === 0 ? (
            <p className="sin-pagos">
              Este alumno no ha realizado ningún pago.
            </p>
          ) : (
            <table className="tabla-pagos">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Mes</th>
                  <th>Pago (MXN)</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => {
                  const conceptoNombre =
                    conceptosMap[pago.id_conceptoPago] || pago.id_conceptoPago;

                  return (
                    <tr key={pago.id_pago}>
                      <td>{conceptoNombre}</td>
                      <td>{pago.mes || "—"}</td>
                      <td>
                        {Number(pago.pagoFinal || 0).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
