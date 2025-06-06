import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/pages/RealizarPago.css";

export default function RealizarPago() {
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [paymentType, setPaymentType] = useState("colegiatura");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [metodos, setMetodos] = useState([]);
  const [selectedMetodo, setSelectedMetodo] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    async function fetchData() {
      try {
        const matricula = localStorage.getItem("matricula");
        if (!matricula) {
          navigate("/alumnos");
          return;
        }

        const urlAlumno = `${
          import.meta.env.VITE_API_PROXY || ""
        }/api/alumno/?matricula=${matricula}`;

        const respAlumno = await axios.get(urlAlumno);
        const dataAlumno = respAlumno.data;
        if (dataAlumno.status !== "ok" || !Array.isArray(dataAlumno.alumnos)) {
          throw new Error("No se encontró lista válida de alumnos.");
        }

        const foundAlumno = dataAlumno.alumnos.find(
          (a) => String(a.matricula).trim() === String(matricula).trim()
        );
        if (!foundAlumno) {
          navigate("/alumnos");
          return;
        }

        let descuentoBeca = 0;
        if (foundAlumno.id_beca) {
          try {
            const urlBeca = `${import.meta.env.VITE_API_PROXY || ""}/api/beca/${
              foundAlumno.id_beca
            }`;
            const respBeca = await axios.get(urlBeca);
            if (respBeca.data.status === "ok" && respBeca.data.beca) {
              descuentoBeca = parseFloat(respBeca.data.beca.descuento || 0);
            }
          } catch {
          }
        }

        const urlCarreras = `${
          import.meta.env.VITE_API_PROXY || ""
        }/api/carrera/`;
        const respCarreras = await axios.get(urlCarreras);
        const dataCarreras = respCarreras.data;
        if (
          dataCarreras.status !== "ok" ||
          !Array.isArray(dataCarreras.carreras)
        ) {
          throw new Error("Lista de carreras inválida.");
        }

        let costoMensualidad = 0,
          costoInscripcion = 0,
          nombreCarrera = "";
        for (const carrera of dataCarreras.carreras) {
          const foundSemestre = carrera.semestres.find(
            (cs) => cs.id_carrera_semestre === foundAlumno.carrera_semestre
          );
          if (foundSemestre) {
            nombreCarrera = carrera.nombre;
            costoMensualidad = parseFloat(foundSemestre.costo_mensualidad);
            costoInscripcion = parseFloat(foundSemestre.costo_inscripcion);
            break;
          }
        }

        setAlumno({
          ...foundAlumno,
          descuento: descuentoBeca,
          costo_mensualidad: costoMensualidad,
          costo_inscripcion: costoInscripcion,
          nombreCarrera,
        });

        try {
          const urlMetodos = `${
            import.meta.env.VITE_API_PROXY || ""
          }/api/pago/metodos`;
          const respMetodos = await axios.get(urlMetodos);
          if (
            respMetodos.data.status === "ok" &&
            Array.isArray(respMetodos.data.metodos)
          ) {
            setMetodos(respMetodos.data.metodos);
          }
        } catch {
        }

        try {
          const urlPagos = `${
            import.meta.env.VITE_API_PROXY || ""
          }/api/pago/?id_alumno=${foundAlumno.id_alumno}`;
          const respPagos = await axios.get(urlPagos);
          if (Array.isArray(respPagos.data.pagos)) {
            setPagos(respPagos.data.pagos);
          }
        } catch {
        }

        setLoading(false);
      } catch (err) {
        setErrorMsg("No se pudieron cargar datos del alumno.");
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!alumno) return;

    let costoBase =
      paymentType === "inscripcion"
        ? alumno.costo_inscripcion
        : alumno.costo_mensualidad;

    let finalMonto = costoBase;
    if (paymentType === "colegiatura" && alumno.descuento) {
      finalMonto = Math.round(costoBase * (1 - parseFloat(alumno.descuento)));
    }

    if (paymentType === "colegiatura" && !selectedMonth) {
      setAmountToPay(0);
      return;
    }

    setAmountToPay(finalMonto);
  }, [alumno, paymentType, selectedMonth]);

  const handleConfirmarPago = async (e) => {
    e.preventDefault();
    if (!selectedMetodo) {
      alert("Selecciona un método de pago.");
      return;
    }
    if (paymentType === "colegiatura" && !selectedMonth) {
      alert("Selecciona un mes para pagar.");
      return;
    }

    const concepto = paymentType === "inscripcion" ? 2 : 1;

    let costoBase =
      paymentType === "inscripcion"
        ? alumno.costo_inscripcion
        : alumno.costo_mensualidad;
    let finalMonto = costoBase;
    if (paymentType === "colegiatura" && alumno.descuento) {
      finalMonto = Math.round(costoBase * (1 - parseFloat(alumno.descuento)));
    }

    const monthEntry = meses.find((m) => m.nombre === selectedMonth);

    const body = {
      id_alumno: alumno.id_alumno,
      id_conceptoPago: concepto,
      id_metodo_pago: Number(selectedMetodo),
      id_carrera_semestre: alumno.carrera_semestre,
      id_mes: paymentType === "colegiatura" ? monthEntry?.id : null,
      total: Number(costoBase.toFixed(2)),
      pagoFinal: Number(finalMonto.toFixed(2)),
    };

    try {
      const resp = await axios.post("/api/pago/", body);
      if (resp.data.status === "ok") {
        alert("Pago registrado con éxito.");
        navigate("/libreta-pago");
      } else {
        alert("Ocurrió un problema al registrar el pago.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    }
  };

  if (loading) {
    return (
      <div className="layout-alumno">
        <Sidebar />
        <div className="realizar-pago-container">
          <p>⏳ Cargando...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="layout-alumno">
        <Sidebar />
        <div className="realizar-pago-container">
          <p className="error">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const inscripcionPagada = pagos.some(
    (p) => p.id_conceptoPago === 2 && p.id_alumno === alumno?.id_alumno
  );

  return (
    <div className="layout-alumno">
      <Sidebar />
      <div className="realizar-pago-container">
        <h1 className="page-title">Realizar Pago</h1>

        {alumno && (
          <div className="alumno-info">
            <h2>Datos del Alumno</h2>
            <p>
              <strong>Nombre:</strong> {alumno.nombre} {alumno.apellido_pat}{" "}
              {alumno.apellido_mat}
            </p>
            <p>
              <strong>Licenciatura:</strong>{" "}
              {alumno.nombreCarrera || alumno.carrera}
            </p>
            <p>
              <strong>Semestre:</strong> {alumno.semestre}
            </p>
            {alumno.descuento > 0 && (
              <p className="beca-info">
                Tienes beca asignada ({(alumno.descuento * 100).toFixed(0)}% de
                descuento)
              </p>
            )}
          </div>
        )}

        <div className="pago-card">
          <form className="pago-form" onSubmit={handleConfirmarPago}>
            <div className="form-group">
              <label>Tipo de pago:</label>
              <div className="tipo-container">
                <label>
                  <input
                    type="radio"
                    name="tipoPago"
                    value="colegiatura"
                    checked={paymentType === "colegiatura"}
                    onChange={() => {
                      setPaymentType("colegiatura");
                      setSelectedMonth("");
                    }}
                  />
                  Colegiatura
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipoPago"
                    value="inscripcion"
                    checked={paymentType === "inscripcion"}
                    onChange={() => {
                      setPaymentType("inscripcion");
                      setSelectedMonth("inscripción");
                    }}
                    disabled={inscripcionPagada}
                  />
                  {inscripcionPagada ? "Inscripción (Pagado)" : "Inscripción"}
                </label>
              </div>
            </div>

            {paymentType === "colegiatura" && (
              <div className="form-group">
                <label>Mes a pagar:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona un mes --</option>
                  {meses
                    .filter((m) => m.id !== null)
                    .map((m) => {
                      const pagoExistente = pagos.find(
                        (p) =>
                          p.id_conceptoPago === 1 &&
                          p.mes?.toLowerCase().trim() ===
                            m.nombre.toLowerCase().trim()
                      );
                      const label =
                        m.nombre.charAt(0).toUpperCase() + m.nombre.slice(1);
                      return (
                        <option
                          key={m.id}
                          value={m.nombre}
                          disabled={!!pagoExistente}
                        >
                          {label}
                          {pagoExistente ? " (Pagado)" : ""}
                        </option>
                      );
                    })}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Monto a pagar:</label>
              <div className="amount-display">
                ${" "}
                {amountToPay
                  ? amountToPay.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })
                  : "0.00"}
              </div>
            </div>

            <div className="form-group">
              <label>Método de pago:</label>
              <select
                value={selectedMetodo}
                onChange={(e) => setSelectedMetodo(e.target.value)}
                required
              >
                <option value="">-- Selecciona un método de pago --</option>
                {metodos.map((m) => (
                  <option key={m.id_metodoPago} value={m.id_metodoPago}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const metodoObj = metodos.find(
                (m) => String(m.id_metodoPago) === String(selectedMetodo)
              );
              if (metodoObj && metodoObj.nombre === "Tarjeta") {
                return (
                  <>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Número de tarjeta:</label>
                      <input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required
                        maxLength={16}
                        pattern="\d{16}"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardExpiry">
                        Fecha de expiración (MM/AA):
                      </label>
                      <input
                        id="cardExpiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        required
                        pattern="(0[1-9]|1[0-2])\/\d{2}"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCvv">CVV:</label>
                      <input
                        id="cardCvv"
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        required
                        maxLength={3}
                        pattern="\d{3}"
                      />
                    </div>
                  </>
                );
              }
              return null;
            })()}

            <button type="submit" className="btn-submit">
              Confirmar Pago
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}