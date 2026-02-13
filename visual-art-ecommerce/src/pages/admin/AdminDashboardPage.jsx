import React, { useEffect, useMemo, useState } from "react";
import { Badge, Card, Col, Row, Space, Table, Tag, Typography } from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getAllOrders, ORDER_STATUS, ORDER_STATUS_LABEL } from "../../services/ordersStore";
import { getAllProducts } from "../../services/productsStore";

import "./admin-dashboard.css";

const { Title, Text } = Typography;

function brl(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function startOfToday() {
  return dayjs().startOf("day");
}

function startOfMonth() {
  return dayjs().startOf("month");
}

function isSameOrAfter(d, min) {
  return dayjs(d).isSame(min) || dayjs(d).isAfter(min);
}

function statusBadge(status) {
  const map = {
    [ORDER_STATUS.PENDING_PAYMENT]: { s: "warning", tag: "gold" },
    [ORDER_STATUS.PROCESSING]: { s: "processing", tag: "blue" },
    [ORDER_STATUS.ON_HOLD]: { s: "default", tag: "default" },
    [ORDER_STATUS.COMPLETED]: { s: "success", tag: "green" },
    [ORDER_STATUS.FAILED]: { s: "error", tag: "red" },
    [ORDER_STATUS.TRASH]: { s: "default", tag: "default" },
  };
  return map[status] || { s: "default", tag: "default" };
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  function refresh() {
    setOrders(getAllOrders());
    setProducts(getAllProducts());
  }

  useEffect(() => {
    refresh();

    // atualiza a cada 5s (simula painel vivo)
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  const metrics = useMemo(() => {
    const todayMin = startOfToday();
    const monthMin = startOfMonth();

    const ordersToday = orders.filter((o) => isSameOrAfter(o.createdAt, todayMin) && o.status !== ORDER_STATUS.TRASH);

    const completedThisMonth = orders.filter(
      (o) =>
        isSameOrAfter(o.createdAt, monthMin) &&
        o.status === ORDER_STATUS.COMPLETED
    );

    const revenueMonth = completedThisMonth.reduce((acc, o) => acc + Number(o.total || 0), 0);

    const activeProducts = products.filter((p) => p.active);
    const featuredCount = activeProducts.filter((p) => p.featured).length;

    // clientes únicos pelos pedidos (email)
    const clientSet = new Set(
      orders
        .filter((o) => o.status !== ORDER_STATUS.TRASH)
        .map((o) => (o.customerEmail || "").trim().toLowerCase())
        .filter(Boolean)
    );

    // alertas
    const pendingPay = orders.filter((o) => o.status === ORDER_STATUS.PENDING_PAYMENT).length;
    const failed = orders.filter((o) => o.status === ORDER_STATUS.FAILED).length;
    const onHold = orders.filter((o) => o.status === ORDER_STATUS.ON_HOLD).length;

    return {
      ordersToday: ordersToday.length,
      revenueMonth,
      activeProducts: activeProducts.length,
      featuredCount,
      clients: clientSet.size,
      alerts: { pendingPay, failed, onHold },
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .filter((o) => o.status !== ORDER_STATUS.TRASH)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .slice(0, 8);
  }, [orders]);

  const columns = [
    {
      title: "Pedido",
      key: "order",
      render: (_, o) => (
        <Space direction="vertical" size={0}>
          <Text strong>#{o.id}</Text>
          <Text type="secondary">{o.customerName}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, o) => {
        const meta = statusBadge(o.status);
        return (
          <Space>
            <Badge status={meta.s} />
            <Tag color={meta.tag}>{ORDER_STATUS_LABEL[o.status] || o.status}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (v) => dayjs(v).format("DD/MM"),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 140,
      render: (v) => <Text strong>{brl(v)}</Text>,
    },
  ];

  return (
    <div className="ad">
      <div className="ad__header">
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Visão geral do desempenho da loja.</Text>
      </div>

      {/* Cards métricas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card bordered={false} className="ad__kpi">
            <Text type="secondary">Pedidos hoje</Text>
            <div className="ad__kpiRow">
              <CalendarOutlined className="ad__kpiIcon" />
              <Title level={2} style={{ margin: 0 }}>{metrics.ordersToday}</Title>
            </div>
            <Tag color="green">+ painéis vivos</Tag>
          </Card>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Card bordered={false} className="ad__kpi">
            <Text type="secondary">Receita (mês)</Text>
            <div className="ad__kpiRow">
              <DollarOutlined className="ad__kpiIcon" />
              <Title level={3} style={{ margin: 0 }}>{brl(metrics.revenueMonth)}</Title>
            </div>
            <Tag color="blue">Só pedidos concluídos</Tag>
          </Card>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Card bordered={false} className="ad__kpi">
            <Text type="secondary">Produtos ativos</Text>
            <div className="ad__kpiRow">
              <AppstoreOutlined className="ad__kpiIcon" />
              <Title level={2} style={{ margin: 0 }}>{metrics.activeProducts}</Title>
            </div>
            <Tag color="gold">{metrics.featuredCount} em destaque</Tag>
          </Card>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Card bordered={false} className="ad__kpi">
            <Text type="secondary">Clientes</Text>
            <div className="ad__kpiRow">
              <TeamOutlined className="ad__kpiIcon" />
              <Title level={2} style={{ margin: 0 }}>{metrics.clients}</Title>
            </div>
            <Tag color="purple">Únicos por e-mail</Tag>
          </Card>
        </Col>
      </Row>

      {/* Tabela + Alertas */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card bordered={false} className="ad__card">
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>Pedidos recentes</Title>
              <Text type="secondary">Últimos pedidos criados na loja.</Text>
            </Space>

            <Table
              style={{ marginTop: 12 }}
              rowKey="id"
              columns={columns}
              dataSource={recentOrders}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card bordered={false} className="ad__card">
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>Alertas</Title>
              <Text type="secondary">Pendências e atenção do dia.</Text>
            </Space>

            <div className="ad__alerts">
              <div className="ad__alertRow">
                <Badge status="warning" />
                <Text>Pagamento pendente</Text>
                <Text strong className="ad__alertValue">{metrics.alerts.pendingPay}</Text>
              </div>

              <div className="ad__alertRow">
                <Badge status="default" />
                <Text>Aguardando</Text>
                <Text strong className="ad__alertValue">{metrics.alerts.onHold}</Text>
              </div>

              <div className="ad__alertRow">
                <Badge status="error" />
                <Text>Falhados</Text>
                <Text strong className="ad__alertValue">{metrics.alerts.failed}</Text>
              </div>

              <div className="ad__alertHint">
                <Text type="secondary">
                  Esses números vêm do mesmo store local dos pedidos.
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
