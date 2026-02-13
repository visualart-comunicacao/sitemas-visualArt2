import { useEffect, useMemo, useState } from 'react'
import { Layout, Menu, Button, Typography, Dropdown, Badge, Avatar, Divider } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { useAuth } from '@/store/auth/AuthContext'
import '../../shared/styles/responsive.css'

dayjs.locale('pt-br')

const { Header, Sider, Content } = Layout
const { Text, Title } = Typography

function useSelectedKey() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/customers')) return 'customers'
  if (pathname.startsWith('/catalog')) return 'catalog'
  if (pathname.startsWith('/orders')) return 'orders'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/visual-chat')) return 'visual-chat'
  if (pathname.startsWith('/quotes')) return 'orders' // ou 'quotes'
  return 'dashboard'
}

export default function AppLayout() {
  const navigate = useNavigate()
  const selected = useSelectedKey()
  const { user, logout, isAdmin } = useAuth()

  const [collapsed, setCollapsed] = useState(false)
  const [now, setNow] = useState(() => dayjs())

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(t)
  }, [])

  const menuItems = useMemo(() => {
    const base = [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/'),
      },
      {
        key: 'customers',
        icon: <TeamOutlined />,
        label: 'Clientes',
        onClick: () => navigate('/customers'),
      },
      {
        key: 'catalog',
        icon: <ShoppingOutlined />,
        label: 'Catálogo',
        onClick: () => navigate('/catalog/products'),
      },
      {
        key: 'orders',
        icon: <FileTextOutlined />,
        label: 'Orçamentos',
        onClick: () => navigate('/quotes'),
      },
      {
        key: 'visual-chat',
        icon: <WhatsAppOutlined />,
        label: 'Visual Chat',
        onClick: () => navigate('/visual-chat'),
      },
    ]

    if (isAdmin) {
      base.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'Admin',
        onClick: () => navigate('/admin'),
      })
    }

    return base
  }, [navigate, isAdmin])

  // Notificações mock (depois ligamos na API)
  const notifications = [
    { id: 'n1', title: 'Novo pedido aprovado', desc: 'PED-2026-000012' },
    { id: 'n2', title: 'Estoque baixo', desc: 'Produto: Adesivo Vinil' },
  ]

  const notificationsMenu = {
    items: [
      { key: 'header', label: <Text strong>Notificações</Text>, disabled: true },
      ...notifications.map((n) => ({
        key: n.id,
        label: (
          <div style={{ width: 260 }}>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{n.desc}</div>
          </div>
        ),
      })),
      { type: 'divider' },
      {
        key: 'all',
        label: <Text>Ver todas</Text>,
        onClick: () => navigate('/orders'),
      },
    ],
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Meu perfil',
        onClick: () => navigate('/profile'),
        disabled: true, // habilitamos quando criarmos a tela
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: 'Sair',
        icon: <LogoutOutlined />,
        onClick: logout,
      },
    ],
  }

  const pageTitle = useMemo(() => {
    if (selected === 'dashboard') return 'Dashboard'
    if (selected === 'customers') return 'Clientes'
    if (selected === 'catalog') return 'Catálogo'
    if (selected === 'orders') return 'Orçamentos e Pedidos'
    if (selected === 'admin') return 'Admin'
    if (selected === 'visual-chat') return 'Visual Chat'
    return 'ERP'
  }, [selected])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          background: '#fff',
          borderRight: '1px solid #E6ECE9',
          padding: 12,
        }}
      >
        {/* TOPO: Logo + ícones */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            marginBottom: 10,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: 'rgba(0,168,89,0.10)',
                border: '1px solid rgba(0,168,89,0.18)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                color: '#066C47',
              }}
            >
              Visual Art
            </div>
          </div>

          {/* Ícones */}
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button type="text" icon={<UserOutlined />} />
              <Button type="text" icon={<BellOutlined />} />
              <Button type="text" icon={<LogoutOutlined />} onClick={logout} />
            </div>
          )}
        </div>

        {/* MENU */}
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            paddingTop: 6,
          }}
        />
      </Sider>

      <Layout>
        {/* HEADER BAR */}
        <Header
          style={{
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            borderBottom: '1px solid #DCE9E3',
            borderTop: '4px solid #00A859',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* LADO ESQUERDO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((v) => !v)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontWeight: 600 }}>{pageTitle}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>
                {dayjs().format('dddd, DD [de] MMMM [de] YYYY')}
              </span>
            </div>
          </div>

          {/* LADO DIREITO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Badge count={2} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>

            <div
              style={{
                width: 1,
                height: 28,
                background: '#E6ECE9',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </div>
              </div>
            </div>
          </div>
        </Header>

        {/* CONTENT */}
        <Content style={{ padding: 16 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #DCE9E3',
              borderRadius: 16,
              padding: 16,
              minHeight: 'calc(100vh - 64px - 32px)',
              boxShadow: '0 10px 28px rgba(6,108,71,0.06)',
              minWidth: 0, // ✅ permite o conteúdo encolher
              overflow: 'hidden', // ✅ evita “vazar” horizontal
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
