import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import RequireAdmin from "./components/auth/RequireAdmin";
import AdminLayout from "./components/admin/AdminLayout";

import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage";
import HomePage from "./pages/Home";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import RegisterPage from "./pages/RegisterPage";


function Page({ title }) {
  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}

export default function App() {
  return (
    <Routes>

      {/* ===================== */}
      {/* ÁREA PÚBLICA (LOJA)  */}
      {/* ===================== */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage title="Home" />} />
        <Route path="/categorias" element={<Page title="Categorias" />} />
        <Route path="/contato" element={<Page title="Contato" />} />
        <Route path="/carrinho" element={<Page title="Carrinho" />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastrar" element={<RegisterPage />} />
      </Route>

      {/* ===================== */}
      {/* ÁREA ADMIN           */}
      {/* ===================== */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        {/* redirect /admin → dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="clientes" element={<AdminCustomersPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="produtos" element={<AdminProductsPage />} />
        <Route path="campanhas" element={<AdminCampaignsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
      </Route>

      {/* ===================== */}
      {/* 404 */}
      {/* ===================== */}
      <Route path="*" element={<Page title="404 - Página não encontrada" />} />

    </Routes>
  );
}
