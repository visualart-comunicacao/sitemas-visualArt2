import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Dropdown, Grid, Layout, Menu, Space, Typography } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useAuth } from "../../context/AuthContext";
import "./admin-layout.css";

dayjs.locale("pt-br");

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const ADMIN_MENU = [
  { key: "/admin/dashboard", icon: <BarChartOutlined />, label: "Dashboard" },
  { key: "/admin/clientes", icon: <UserOutlined />, label: "Clientes" },
  { key: "/admin/produtos", icon: <AppstoreOutlined />, label: "Produtos" },
  { key: "/admin/pedidos", icon: <ShoppingOutlined />, label: "Pedidos" },
  { key: "/admin/campanhas", icon: <AppstoreOutlined />, label: "Campanhas" },
  { key: "/admin/configuracoes", icon: <SettingOutlined />, label: "Configurações" },
];

function getSelectedAdminKey(pathname) {
  const found = ADMIN_MENU.find((i) => pathname.startsWith(i.key));
  return found?.key || "/admin/dashboard";
}

export default function AdminLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(dayjs());

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = useMemo(() => getSelectedAdminKey(pathname), [pathname]);

  const { user, logout } = useAuth();

  // relógio ao vivo
  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  // exemplo de notificações (mock)
  const notifications = [
    { key: "n1", label: "Novo pedido recebido (#1042)" },
    { key: "n2", label: "Produto com estoque baixo (Adesivo Vinil)" },
    { key: "n3", label: "3 solicitações de orçamento" },
  ];

  const notifMenu = {
    items: notifications.map((n) => ({ key: n.key, label: n.label })),
  };

  const userMenu = {
    items: [
      { key: "profile", label: "Perfil" },
      {
        key: "logout",
        label: "Sair",
        icon: <LogoutOutlined />,
        onClick: () => {
          logout();
          navigate("/");
        },
      },
    ],
  };

  return (
    <Layout className="ad">
      <Sider
        className="ad__sider"
        width={260}
        collapsedWidth={isMobile ? 0 : 86}
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        theme="light"
      >
        <div className={`ad__brand ${collapsed ? "is-collapsed" : ""}`} onClick={() => navigate("/admin/dashboard")}>
          <div className="ad__logo">V</div>
          {!collapsed && (
            <div className="ad__brandText">
              <div className="ad__brandName">Visual Art</div>
              <div className="ad__brandSub">Admin Panel</div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={ADMIN_MENU}
          onClick={(e) => navigate(e.key)}
          className="ad__menu"
        />
      </Sider>

      <Layout>
        <Header className="ad__header">
          <div className="ad__headerLeft">
            <Button
              type="text"
              className="ad__collapseBtn"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((v) => !v)}
            />
            <div className="ad__datetime">
              <Text className="ad__date">{now.format("dddd, D [de] MMMM")}</Text>
              <Text className="ad__time">{now.format("HH:mm:ss")}</Text>
            </div>
          </div>

          <div className="ad__headerRight">
            <Space size={12}>
              <Dropdown menu={notifMenu} trigger={["click"]} placement="bottomRight">
                <Badge count={notifications.length} size="small" overflowCount={99}>
                  <Button type="text" icon={<NotificationOutlined />} />
                </Badge>
              </Dropdown>

              <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
                <Button type="text" icon={<UserOutlined />}>
                  {!isMobile ? (user?.name || "Admin") : null}
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className="ad__content">
          <div className="ad__contentInner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
