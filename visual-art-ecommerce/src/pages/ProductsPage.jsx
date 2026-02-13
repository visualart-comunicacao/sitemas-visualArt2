import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Row, Tag, Typography } from "antd";
import { FilterOutlined, ShoppingCartOutlined } from "@ant-design/icons";

import ProductDetailsModal from "../components/product/ProductDetailsModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import { getActiveProducts, seedProductsIfEmpty } from "../services/productsStore";

import "./products-page.css";

const { Title, Paragraph, Text } = Typography;

function buildCategoriesFromProducts(products) {
  const map = new Map();

  for (const p of products) {
    if (!p.category) continue;
    const label = p.categoryLabel || p.category;
    map.set(p.category, label);
  }

  const dynamic = Array.from(map.entries()).map(([key, label]) => ({
    key,
    label,
    emoji: "🛍️",
  }));

  return [{ key: "ALL", label: "Todos", emoji: "🟢" }, ...dynamic];
}

export default function ProductsPage() {
  const [category, setCategory] = useState("ALL");
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [products, setProducts] = useState([]);

  const { isLoggedIn, role } = useAuth();
  const { addOne } = useCart();

  function loadProducts() {
    seedProductsIfEmpty(); // garante seed se estiver vazio
    setProducts(getActiveProducts()); // só ativos aparecem na loja
  }

  useEffect(() => {
    loadProducts();

    // Atualiza se mudar em outra aba/janela
    const onStorage = (e) => {
      if (e.key === "va_products_v1") loadProducts();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const CATEGORIES = useMemo(
    () => buildCategoriesFromProducts(products),
    [products]
  );

  function openDetails(p) {
    setSelected(p);
    setOpen(true);
  }

  const filtered = useMemo(() => {
    const normalized = q.trim().toLowerCase();

    return products.filter((p) => {
      const matchCategory = category === "ALL" ? true : p.category === category;

      const matchQuery =
        !normalized ||
        (p.title || "").toLowerCase().includes(normalized) ||
        (p.desc || "").toLowerCase().includes(normalized) ||
        (p.categoryLabel || "").toLowerCase().includes(normalized);

      return matchCategory && matchQuery;
    });
  }, [products, category, q]);

  return (
    <div className="pp">
      {/* faixa de filtros (chips) */}
      <div className="pp__top">
        <div className="pp__chipsWrap">
          <div className="pp__chips">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`pp__chip ${category === c.key ? "is-active" : ""}`}
                onClick={() => setCategory(c.key)}
                type="button"
              >
                <span className="pp__chipEmoji">{c.emoji}</span>
                <span className="pp__chipLabel">{c.label}</span>
              </button>
            ))}
          </div>

          <div className="pp__search">
            <Input
              allowClear
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos..."
              prefix={<FilterOutlined />}
            />
          </div>
        </div>
      </div>

      {/* header central */}
      <div className="pp__header">
        <Title level={2} className="pp__title">
          Nossos Produtos
        </Title>
        <Paragraph className="pp__subtitle">
          Explore nossa linha completa de produtos de comunicação visual e
          encontre a solução perfeita para sua marca.
        </Paragraph>
      </div>

      {/* grid de cards */}
      <Row gutter={[16, 16]} className="pp__grid">
        {filtered.map((p) => (
          <Col key={p.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              className={`pp__card ${p.featured ? "is-featured" : ""}`}
              bordered={false}
              hoverable
              onClick={() => openDetails(p)}
            >
              <div className="pp__media">
                <div className="pp__icon">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 20,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    // fallback caso não tenha imagem
                    <span style={{ fontSize: 40 }}>🖼️</span>
                  )}
                </div>
              </div>

              <div className="pp__body">
                <Tag className="pp__tag" color="green">
                  {p.categoryLabel || p.category}
                </Tag>

                <Title level={4} className="pp__cardTitle">
                  {p.title}
                </Title>

                <Text className="pp__cardDesc" style={{ whiteSpace: "pre-line" }}>{p.desc || "—"}</Text>

                <div className="pp__actions">
                  <Button
                    type="primary"
                    className="pp__btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLoggedIn && role === "CLIENTE") addOne();
                      else openDetails(p);
                    }}
                    icon={<ShoppingCartOutlined />}
                  >
                    {isLoggedIn && role === "CLIENTE"
                      ? "Adicionar"
                      : "Ver detalhes"}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div className="pp__empty">
          <Title level={4} style={{ margin: 0 }}>
            Nada encontrado
          </Title>
          <Text type="secondary">
            Se você criou produtos no admin, confira se eles estão <b>Ativos</b>.
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button onClick={loadProducts}>Recarregar</Button>
          </div>
        </div>
      )}

      <ProductDetailsModal
        open={open}
        product={selected}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
