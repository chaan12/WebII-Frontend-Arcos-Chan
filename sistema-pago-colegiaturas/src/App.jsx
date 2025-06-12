import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginAlumno from "./pages/LoginAlumno";
import LoginAdmin from "./pages/LoginAdmin";
import HomeAlumno from "./pages/HomeAlumno";
import LibretaPago from "./pages/LibretaPago"; 
import RealizarPago from "./pages/RealizarPago";
import Cuenta from "./pages/Cuenta";
import HomeAdmin from "./pages/HomeAdmin";
import GestionPagos from "./pages/GestionPagos";
import VerAlumnos from "./pages/VerAlumnos";
import GestionAlumnos from "./pages/GestionAlumnos";
import EditarAlumnos from "./pages/EditarAlumnos";
import EliminarAlumno from "./pages/EliminarAlumnos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/alumnos" element={<LoginAlumno />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/home-admin" element={<HomeAdmin />} />
        <Route path="/admin/pagos" element={<GestionPagos />} />
        <Route path="/admin/gestionar-alumnos" element={<GestionAlumnos />} />
        <Route path="/admin/editar-alumnos" element={<EditarAlumnos />} />
        <Route path="/admin/editar-alumno/:id" element={<EditarAlumnos />} />
        <Route path="/admin/eliminar-alumnos" element={<EliminarAlumno />} />
        <Route path="/admin/eliminar-alumno/:id" element={<EliminarAlumno />} />
        <Route path="/admin/alumnos" element={<VerAlumnos />} />
        <Route path="/home-alumno" element={<HomeAlumno />} />
        <Route path="/libreta-pago" element={<LibretaPago />} />{" "}
        <Route path="/realizar-pago" element={<RealizarPago />} />
        <Route path="/mi-cuenta" element={<Cuenta />} />
      </Routes>
    </BrowserRouter>
  );
}
