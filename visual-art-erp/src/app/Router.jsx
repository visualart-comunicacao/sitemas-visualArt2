import React from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from '@/app/guards/ProtectedRoute'
import AdminRoute from '@/app/guards/AdminRoute'

import AppLayout from '@/app/layouts/AppLayout'
import AuthLayout from '@/app/layouts/AuthLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import VisualChatPage from '@/modules/visual-chat/pages/VisualChatPage'
import CustomersListPage from '@/modules/customers/pages/CustomersListPage'
// Pages (vamos criar agora “placeholder” simples)
function DashboardPage() {
  return <div>Dashboard</div>
}
function ProductsListPage() {
  return <div>Produtos</div>
}
function OrdersListPage() {
  return <div>Orçamentos/Pedidos</div>
}
function AdminDashboardPage() {
  return <div>Admin</div>
}

export default function Router() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/catalog/products" element={<ProductsListPage />} />
        <Route path="/orders" element={<OrdersListPage />} />

        <Route path="/visual-chat" element={<VisualChatPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  )
}
