import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastHost from "./components/ToastHost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inicio from "./pages/Inicio";
import Despensa from "./pages/Despensa";
import Recetas from "./pages/Recetas";
import RecipeDetail from "./pages/RecipeDetail";
import GuidedCooking from "./pages/GuidedCooking";
import PlanSemanal from "./pages/PlanSemanal";
import ListaCompra from "./pages/ListaCompra";
import Ajustes from "./pages/Ajustes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/despensa" element={<Despensa />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/recetas/:id" element={<RecipeDetail />} />
            <Route path="/recetas/:id/guiado" element={<GuidedCooking />} />
            <Route path="/plan" element={<PlanSemanal />} />
            <Route path="/compra" element={<ListaCompra />} />
            <Route path="/ajustes" element={<Ajustes />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
