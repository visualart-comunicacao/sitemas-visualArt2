import React, { useMemo, useState } from "react";
import { Badge, Button, Drawer, Grid, Layout, Menu, Space, Typography } from "antd";
import { LoginOutlined, MenuOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../../config/nav";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./navbar.css";

const { Header } = Layout;
const { useBreakpoint } = Grid;

function getSelectedKey(pathname) {
  // Home só quando for exatamente "/"
  if (pathname === "/") return "/";

  // ordena do maior path pro menor
  const sorted = [...NAV_ITEMS].sort(
    (a, b) => b.key.length - a.key.length
  );

  // encontra o match mais específico
  const found = sorted.find(
    (i) => i.key !== "/" && pathname.startsWith(i.key)
  );

  return found?.key || "";
}

export default function Navbar() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { isLoggedIn, role } = useAuth();
  const { cartCount } = useCart();

  const selectedKey = useMemo(() => getSelectedKey(pathname), [pathname]);

  const menuItems = useMemo(
    () => NAV_ITEMS.map((i) => ({ key: i.key, label: i.label })),
    []
  );

  function onMenuClick(e) {
    navigate(e.key);
    setDrawerOpen(false);
  }

  const showCart = isLoggedIn && role === "CLIENTE";

  return (
    <Header className="va-header">
      <div className="va-inner">
        {/* ESQUERDA: Logo */}
        <div className="va-left" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <div className="va-logoMark">
            <img src="/img/favicon.png" style={{ maxWidth: '30px' }} alt="" />
          </div>
          <Typography.Text className="va-logoText">
            Visual Art - Loja
          </Typography.Text>
        </div>

        {/* CENTRO: Menu (desktop) */}
        {!isMobile && (
          <div className="va-center">
            <Menu
              mode="horizontal"
              className="va-menu"
              items={menuItems}
              selectedKeys={[selectedKey]}
              onClick={onMenuClick}
            />
          </div>
        )}

        {/* DIREITA: ações */}
        <div className="va-right">
          {isMobile ? (
            <Button
              type="text"
              aria-label="Abrir menu"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
            />
          ) : (
            <Space size={10}>
              {showCart ? (
                <Badge count={cartCount} size="small" overflowCount={99}>
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate("/carrinho")}
                  />
                </Badge>
              ) : (
                <Button
                  icon={<LoginOutlined />}
                  type="primary"
                  onClick={() => navigate("/entrar")}
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #22c55e)",
                    border: "none",
                  }}
                >
                  Entrar
                </Button>
              )}
            </Space>
          )}
        </div>
      </div>

      {/* Drawer (mobile) */}
      <Drawer
        title="Menu"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={300}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
        />

        <div style={{ marginTop: 16 }}>
          {showCart ? (
            <Button
              block
              icon={<ShoppingCartOutlined />}
              onClick={() => {
                navigate("/carrinho");
                setDrawerOpen(false);
              }}
            >
              Carrinho {cartCount ? `(${cartCount})` : ""}
            </Button>
          ) : (
            <Button
              block
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => {
                navigate("/entrar");
                setDrawerOpen(false);
              }}
            >
              Entrar
            </Button>
          )}
        </div>
      </Drawer>
    </Header>
  );
}
