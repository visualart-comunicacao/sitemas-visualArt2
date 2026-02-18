import React from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from '@/app/guards/ProtectedRoute'
import AdminRoute from '@/app/guards/AdminRoute'

import AppLayout from '@/app/layouts/AppLayout'
import AuthLayout from '@/app/layouts/AuthLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import VisualChatPage from '@/modules/visual-chat/pages/VisualChatPage'
import CustomersListPage from '@/modules/customers/pages/CustomersListPage'
import QuotesListPage from '@/modules/quotes/pages/QuotesListPage'
import QuotesEditPage from '@/modules/quotes/pages/QuotesEditPage'
import ProductEditPage from '../modules/catalog/pages/ProductEditPage'
import ProductsListPage from '../modules/catalog/pages/ProductslistPage'
// Pages (vamos criar agora “placeholder” simples)
function DashboardPage() {
  return <div>Dashboard</div>
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
        <Route path="/catalog/products/new" element={<ProductEditPage mode="create" />} />
        <Route path="/catalog/products/:id/edit" element={<ProductEditPage mode="edit" />} />

        <Route path="/quotes" element={<QuotesListPage />} />
        <Route path="/quotes/new" element={<QuotesEditPage mode="create" />} />
        <Route path="/quotes/:id/edit" element={<QuotesEditPage mode="edit" />} />

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
