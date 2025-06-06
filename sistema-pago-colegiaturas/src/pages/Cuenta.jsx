import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pages/Cuenta.css";
import Sidebar from "../components/Sidebar";

export default function Cuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alumno, setAlumno] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: "",
    apellido_pat: "",
    apellido_mat: "",
    matricula: "",
  });
  const [passwordValues, setPasswordValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    console.log(
      "Cuenta.jsx useEffect triggered; location.state.alumno:",
      location.state?.alumno
    );

    if (location.state && location.state.alumno) {
      const found = location.state.alumno;
      setAlumno(found);
      setFormValues({
        nombre: found.nombre,
        apellido_pat: found.apellido_pat,
        apellido_mat: found.apellido_mat,
        matricula: found.matricula,
      });
      return;
    }

    const matricula = localStorage.getItem("matricula");
    console.log("Cuenta.jsx → matricula from localStorage:", matricula);
    if (!matricula) {
      navigate("/alumnos");
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await fetch(`/api/alumno/?matricula=${matricula}`);
        console.log("Cuenta.jsx → response status:", resp.status);
        const data = await resp.json();
        console.log("Cuenta.jsx → data from API:", data);

        if (
          data.status !== "ok" ||
          !Array.isArray(data.alumnos) ||
          data.alumnos.length === 0
        ) {
          navigate("/alumnos");
          return;
        }

        const found = data.alumnos.find((a) => a.matricula === matricula);
        console.log("Cuenta.jsx → found alumno:", found);
        if (!found) {
          navigate("/alumnos");
          return;
        }

        setAlumno(found);
        setFormValues({
          nombre: found.nombre,
          apellido_pat: found.apellido_pat,
          apellido_mat: found.apellido_mat,
          matricula: found.matricula,
        });
      } catch (err) {
        console.error("Error fetching alumno:", err);
        navigate("/alumnos");
      }
    };

    fetchData();
  }, [navigate, location.state]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordValues.newPassword &&
      !passwordValues.confirmPassword &&
      !passwordValues.oldPassword
    ) {
      setPasswordError("");
      return;
    }

    if (passwordValues.newPassword.length < 4) {
      setPasswordError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    const body = { password: passwordValues.newPassword };
    console.log("Cuenta.jsx → PATCH body:", body);

    try {
      const response = await fetch(`/api/alumno/${alumno.id_alumno}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Cuenta.jsx → PATCH response status:", response.status);
      if (response.ok) {
        localStorage.clear();
        alert(
          "Contraseña cambiada correctamente. Por favor vuelve a iniciar sesión."
        );
        navigate("/alumnos");
      } else {
        let errorText = "";
        try {
          errorText = await response.json();
        } catch {
          errorText = await response.text();
        }
        console.error("Error al actualizar alumno:", errorText);
        alert("Error al guardar los cambios.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Error en la solicitud al servidor.");
    }
  };

  if (!alumno) return null;

  return (
    <div className="cuenta-wrapper">
      <Sidebar />
      <main className="cuenta-container">
        <h1>Mi Cuenta</h1>
        <form className="form-cuenta" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formValues.nombre}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="apellido_pat">Apellido Paterno</label>
            <input
              type="text"
              id="apellido_pat"
              name="apellido_pat"
              value={formValues.apellido_pat}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="apellido_mat">Apellido Materno</label>
            <input
              type="text"
              id="apellido_mat"
              name="apellido_mat"
              value={formValues.apellido_mat}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="matricula">Matrícula</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              value={formValues.matricula}
              disabled
            />
          </div>

          <h2>Cambiar Contraseña</h2>
          {passwordError && <p className="error">{passwordError}</p>}
          <div className="form-group">
            <label htmlFor="oldPassword">Contraseña Actual</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={passwordValues.oldPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordValues.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordValues.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <button type="submit" className="btn-guardar">
            Guardar Cambios
          </button>
        </form>
      </main>
    </div>
  );
}
