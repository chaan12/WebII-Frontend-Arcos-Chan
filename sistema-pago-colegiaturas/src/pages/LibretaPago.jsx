import React, { useEffect, useState } from "react";
import "../styles/pages/LibretaPago.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar"; 

export default function LibretaPago() {
  const [pagos, setPagos] = useState([]);
  const [alumno, setAlumno] = useState(null);
  const [planPago, setPlanPago] = useState("10");
  const navigate = useNavigate();

  useEffect(() => {
    const matricula = localStorage.getItem("matricula");
    if (!matricula) {
      window.location.href = "/alumnos";
      return;
    }

    const fetchData = async () => {
      try {
        const urlAlumno = `${
          import.meta.env.VITE_API_PROXY || ""
        }/api/alumno/?matricula=${matricula}`;

        const respAlumno = await fetch(urlAlumno);
        const textAlumno = await respAlumno.text();
        let dataAlumno;
        try {
          dataAlumno = JSON.parse(textAlumno);
        } catch (err) {
          console.error(
            "❌ Error al parsear JSON de dataAlumno:",
            err,
            "\nTexto recibido:",
            textAlumno
          );
          throw new Error("El servidor de ALUMNO no devolvió JSON válido.");
        }

        if (!dataAlumno.alumnos || !Array.isArray(dataAlumno.alumnos)) {
          console.error(
            "❌ dataAlumno.alumnos no es un array o no existe →",
            dataAlumno.alumnos
          );
          throw new Error("Formato inesperado en dataAlumno.alumnos");
        }
        const alumnoFound = dataAlumno.alumnos.find(
          (a) => a.matricula === matricula
        );
        if (!alumnoFound) {
          window.location.href = "/alumnos";
          return;
        }

        let descuentoBeca = 0;
        if (alumnoFound.id_beca) {
          const urlBeca = `${import.meta.env.VITE_API_PROXY || ""}/api/beca/${
            alumnoFound.id_beca
          }`;
          const respBeca = await fetch(urlBeca);
          if (respBeca.ok) {
            const textBeca = await respBeca.text();
            try {
              const dataBeca = JSON.parse(textBeca);
              descuentoBeca = parseFloat(dataBeca.beca?.descuento ?? 0);
            } catch (err) {
              console.error(
                "❌ Error al parsear JSON de dataBeca:",
                err,
                "\nTexto recibido:",
                textBeca
              );
            }
          }
        }

        const urlCarreras = `${
          import.meta.env.VITE_API_PROXY || ""
        }/api/carrera/`;
        const respCarreras = await fetch(urlCarreras);
        const textCarreras = await respCarreras.text();
        let dataCarreras;
        try {
          dataCarreras = JSON.parse(textCarreras);
        } catch (err) {
          console.error(
            "❌ Error al parsear JSON de dataCarreras:",
            err,
            "\nTexto recibido:",
            textCarreras
          );
          throw new Error("El servidor de CARRERAS no devolvió JSON válido.");
        }

        if (!dataCarreras.carreras || !Array.isArray(dataCarreras.carreras)) {
          console.error(
            "❌ dataCarreras.carreras no es un array o no existe →",
            dataCarreras.carreras
          );
          throw new Error("Formato inesperado en dataCarreras.carreras");
        }

        let costoMensualidad = 0;
        let costoInscripcion = 0;
        let nombreCarrera = "";
        for (const carrera of dataCarreras.carreras) {
          const foundSemestre = carrera.semestres.find(
            (cs) => cs.id_carrera_semestre === alumnoFound.carrera_semestre
          );
          if (foundSemestre) {
            nombreCarrera = carrera.nombre;
            costoMensualidad = foundSemestre.costo_mensualidad;
            costoInscripcion = foundSemestre.costo_inscripcion;
            break;
          }
        }
        setAlumno({
          ...alumnoFound,
          descuento: descuentoBeca,
          costo_mensualidad: costoMensualidad,
          costo_inscripcion: costoInscripcion,
          nombreCarrera,
        });
      } catch (error) {
        console.error("🚨 Error al obtener datos en LibretaPago", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!alumno?.id_alumno) return;

    const obtenerPagos = async () => {
      try {
        const url = `/api/pago/alumno/${alumno.id_alumno}`;
        console.log("Intentando GET en URL proxy:", url);
        const response = await axios.get(url);
        console.log("✅ Pagos cargados para alumno", alumno.id_alumno, response.data.pagos);
        setPagos(Array.isArray(response.data.pagos) ? response.data.pagos : []);
      } catch (error) {
        console.error("❌ Error al cargar pagos:", error);
        console.log("Detalles del error.response:", error.response);
      }
    };

    obtenerPagos();
  }, [alumno]);

  const meses = [
    { id: 9, nombre: "septiembre" },
    { id: 10, nombre: "octubre" },
    { id: 11, nombre: "noviembre" },
    { id: 12, nombre: "diciembre" },
    { id: 1, nombre: "enero" },
    { id: null, nombre: "inscripción" },
    { id: 2, nombre: "febrero" },
    { id: 3, nombre: "marzo" },
    { id: 4, nombre: "abril" },
    { id: 5, nombre: "mayo" },
    { id: 6, nombre: "junio" },
  ];

  const renderPagoBox = (mes, index) => {
    if (!alumno) return null;

    const esInscripcion = mes.id === null;
    let pago = null;

    if (esInscripcion) {
      const pagosIns = pagos.filter(
        (p) => p.id_conceptoPago === 2 && p.id_alumno === alumno.id_alumno
      );
      pago = pagosIns[index === 5 ? 0 : 1] || null;
    } else {
      pago = pagos.find(
        (p) =>
          p.id_conceptoPago === 1 &&
          p.id_alumno === alumno.id_alumno &&
          p.mes?.toLowerCase().trim() === mes.nombre.toLowerCase().trim()
      );
    }

    const pagado =
      pago !== null &&
      pago !== undefined &&
      (parseFloat(pago.total) > 0 || parseFloat(pago.pagoFinal) > 0);
    const costo = esInscripcion
      ? alumno.costo_inscripcion
      : alumno.costo_mensualidad;
    const pagoFinal = esInscripcion
      ? costo
      : Math.round(costo * (1 - (parseFloat(alumno.descuento) || 0)));
    const monto = pagado
      ? pago.id_conceptoPago === 2
        ? pago.total
        : pago.pagoFinal
      : pagoFinal;

    const mesCorto = mes.nombre.slice(0, 3);
    const fechaPago = pagado ? `14/${mesCorto}/2025` : `15/${mesCorto}/2025`;

    return (
      <div
        className={`pago-box ${pagado ? "pagado" : "pendiente"}`}
        key={mes.nombre + index}
      >
        <h3>{mes.nombre.toUpperCase()}</h3>
        {pagado ? (
          <>
            <strong style={{ color: "#28a745" }}>PAGADO</strong>
            <p className="monto">
              ${monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="fecha">{fechaPago}</p>
          </>
        ) : (
          <>
            <p className="monto">
              ${pagoFinal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <div>
              <p className="fecha">Vence {fechaPago}.</p>
              {!esInscripcion && (
                <>
                  <p>Cantidad a pagar después (sin beca):</p>
                  <p className="monto-tachado">
                    $
                    {costo.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </>
              )}
              <p className="referencia">
                15221403241023
                {(mes.id ?? 0).toString().padStart(2, "0")}
                0462022
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="layout-alumno">
      {/* Importamos el componente Sidebar */}
      <Sidebar />

      <div className="libreta-pago-container">
        <h1 className="libreta-pago-title">Libreta de Pago</h1>

        {alumno && (
          <div className="alumno-info">
            <p>
              <strong>Nombre:</strong> {alumno.nombre} {alumno.apellido_pat}{" "}
              {alumno.apellido_mat}
            </p>
            <p>
              <strong>Matrícula:</strong> {alumno.matricula}
            </p>
          </div>
        )}

        <div className="grid-pagos">
          {meses.map((mes, index) => renderPagoBox(mes, index))}
        </div>

        {/* Instrucciones de pago */}
        {alumno && (
          <div className="payment-instructions" style={{ marginTop: "40px" }}>
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: "0",
              }}
            >
              Razón Social: ESCUELA MODELO
            </p>
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: "0",
              }}
            >
              RFC: EMO100510EW5
            </p>
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: "0 0 20px 0",
              }}
            >
              CURSO ESCOLAR 2024 - 2025
            </p>

            <p>
              <strong>Programa:</strong> {alumno.nombreCarrera}
            </p>
            <p>
              <strong>Alumno:</strong> {alumno.matricula} {alumno.nombre}{" "}
              {alumno.apellido_pat} {alumno.apellido_mat}
            </p>
            <p>
              <strong>Plan de {planPago} pagos.</strong>
            </p>
            <p style={{ marginBottom: "20px" }}>
              {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </p>

            <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
              INSTRUCCIONES DE PAGO.
            </p>

            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>BBVA:</p>
            <p style={{ margin: "0 0 8px 0" }}>
              I. PAGO DIRECTO EN SUCURSAL BANCARIA BBVA:
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              1.- SI PAGA EN VENTANILLA O CAJERO AUTOMÁTICO DE SUCURSAL BANCARIA
              BBVA, SELECCIONE PAGO DE SERVICIO CON EL CONVENIO 1852132
            </p>

            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
              II. PAGO EN LÍNEA (APLICACIÓN Ó PORTAL WEB BANCARIO):
            </p>
            <p style={{ margin: "0 0 4px 0" }}>
              A) SI PAGA DE BBVA A BBVA (DESDE SU PORTAL BANCARIO BBVA), UTILICE
              PAGO DE SERVICIO CON EL CONVENIO 1852132
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              B) DESDE OTRO BANCO A BBVA (SPEI), USAR LA CLAVE INTERBANCARIA
              012914002018521323
            </p>

            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>HSBC:</p>
            <p style={{ margin: "0 0 8px 0" }}>
              I. SI PAGA DE HSBC A HSBC, PAGAR COMO SERVICIO 9022
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              II. DESDE OTRO BANCO A HSBC (SPEI), USAR LA CLAVE INTERBANCARIA
              021180550300090224
            </p>

            <p style={{ fontWeight: "bold", marginBottom: "20px" }}>
              NOTA: EN CUALQUIER OPERACIÓN DE PAGO DEBERÁ INGRESARSE LOS 26
              DÍGITOS DEL CONCEPTO DE PAGO O REFERENCIA
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
