import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  bulkUpdate,
  clearOrders,
  deleteOrderHard,
  getAllOrders,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  seedOrdersIfEmpty,
  updateOrder,
} from "../../services/ordersStore";
import OrderDetailsDrawer from "../../components/admin/OrderDetailsDrawer";


import "./admin-orders.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function brl(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_TABS = [
  { key: "ALL", label: "Tudo" },
  { key: ORDER_STATUS.TRASH, label: "Lixo" },
  { key: ORDER_STATUS.PENDING_PAYMENT, label: "Pagamento pendente" },
  { key: ORDER_STATUS.PROCESSING, label: "Processando" },
  { key: ORDER_STATUS.ON_HOLD, label: "Aguardando" },
  { key: ORDER_STATUS.COMPLETED, label: "Concluído" },
  { key: ORDER_STATUS.FAILED, label: "Falhado" },
];

export default function AdminOrdersPage() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [q, setQ] = useState("");
  const [range, setRange] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // filtros rápidos
  const [statusFilter, setStatusFilter] = useState("ALL");

  function openDrawer(order) {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }

  function refresh() {
    setRows(getAllOrders());
  }

  useEffect(() => {
    seedOrdersIfEmpty();
    refresh();
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: rows.length };
    for (const s of Object.values(ORDER_STATUS)) c[s] = 0;
    for (const o of rows) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const [start, end] = range || [];

    return rows.filter((o) => {
      const matchTab = tab === "ALL" ? true : o.status === tab;
      const matchStatus = statusFilter === "ALL" ? true : o.status === statusFilter;

      const matchQuery =
        !nq ||
        String(o.id).includes(nq) ||
        (o.customerName || "").toLowerCase().includes(nq) ||
        (o.customerEmail || "").toLowerCase().includes(nq);

      const matchDate =
        !start || !end
          ? true
          : dayjs(o.createdAt).isAfter(start.startOf("day")) &&
            dayjs(o.createdAt).isBefore(end.endOf("day"));

      return matchTab && matchStatus && matchQuery && matchDate;
    });
  }, [rows, tab, statusFilter, q, range]);

  function statusTag(status) {
    const map = {
      [ORDER_STATUS.PENDING_PAYMENT]: { color: "gold", text: ORDER_STATUS_LABEL.PENDING_PAYMENT },
      [ORDER_STATUS.PROCESSING]: { color: "blue", text: ORDER_STATUS_LABEL.PROCESSING },
      [ORDER_STATUS.ON_HOLD]: { color: "default", text: ORDER_STATUS_LABEL.ON_HOLD },
      [ORDER_STATUS.COMPLETED]: { color: "green", text: ORDER_STATUS_LABEL.COMPLETED },
      [ORDER_STATUS.FAILED]: { color: "red", text: ORDER_STATUS_LABEL.FAILED },
      [ORDER_STATUS.TRASH]: { color: "default", text: ORDER_STATUS_LABEL.TRASH },
    };
    const t = map[status] || { color: "default", text: status };
    return <Tag color={t.color}>{t.text}</Tag>;
  }

  function changeStatus(id, nextStatus) {
    updateOrder(id, { status: nextStatus });
    refresh();

    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    }

    message.success("Status atualizado.");
  }

  function bulkAction(action) {
    if (!selectedRowKeys.length) {
      message.info("Selecione pelo menos um pedido.");
      return;
    }

    if (action === "TRASH") {
      bulkUpdate(selectedRowKeys, { status: ORDER_STATUS.TRASH });
      message.success("Movido para o lixo.");
    }

    if (action === "RESTORE") {
      bulkUpdate(selectedRowKeys, { status: ORDER_STATUS.PROCESSING });
      message.success("Restaurado para Processando.");
    }

    if (action === "DELETE_HARD") {
      Modal.confirm({
        title: "Excluir permanentemente?",
        content: "Isso remove os pedidos do armazenamento local.",
        okText: "Excluir",
        okButtonProps: { danger: true },
        cancelText: "Cancelar",
        onOk: () => {
          selectedRowKeys.forEach((id) => deleteOrderHard(id));
          setSelectedRowKeys([]);
          refresh();
          message.success("Pedidos removidos.");
        },
      });
      return;
    }

    setSelectedRowKeys([]);
    refresh();
  }

  const columns = [
    {
      title: "Pedido",
      key: "order",
      render: (_, o) => (
        <div className="ao__orderCell">
          <div className="ao__orderTop">
            <a className="ao__orderLink" onClick={() => openDrawer(o)}>
              #{o.id}
            </a>
            <span className="ao__by">por</span>
            <Text>{o.customerName}</Text>
          </div>
          <Text type="secondary">{o.customerEmail}</Text>
          <div style={{ marginTop: 6 }}>{statusTag(o.status)}</div>
        </div>
      ),
    },
    {
      title: "Comprado",
      dataIndex: "itemsCount",
      key: "itemsCount",
      width: 110,
      render: (v) => <Text>{v} {v === 1 ? "item" : "itens"}</Text>,
    },
    {
      title: "Enviar para",
      dataIndex: "shippingTo",
      key: "shippingTo",
      render: (v) => <Text>{v || "—"}</Text>,
    },
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v) => <Text>{dayjs(v).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Total",
      key: "total",
      width: 150,
      render: (_, o) => (
        <div>
          <Text strong>{brl(o.total)}</Text>
          <div className="ao__pay">{o.paymentMethod || "—"}</div>
        </div>
      ),
    },
    {
      title: "Ações",
      key: "actions",
      width: 150,
      render: (_, o) => {
        const menuItems = [
          {
            key: "view",
            label: "Ver",
            icon: <EyeOutlined />,
            onClick: () => message.info("Abrir detalhes (próximo passo)"),
          },
          {
            key: "processing",
            label: "Marcar como Processando",
            onClick: () => changeStatus(o.id, ORDER_STATUS.PROCESSING),
          },
          {
            key: "completed",
            label: "Marcar como Concluído",
            onClick: () => changeStatus(o.id, ORDER_STATUS.COMPLETED),
          },
          {
            key: "failed",
            label: "Marcar como Falhado",
            onClick: () => changeStatus(o.id, ORDER_STATUS.FAILED),
          },
          {
            key: "trash",
            label: "Mover para Lixo",
            onClick: () => changeStatus(o.id, ORDER_STATUS.TRASH),
          },
        ];

        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => openDrawer(o)} />
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="ao">
      <Card bordered={false} className="ao__card">
        <div className="ao__topBar">
          <div>
            <Title level={3} style={{ margin: 0 }}>Pedidos</Title>
            <Text type="secondary">Gerencie os pedidos da loja (localStorage por enquanto).</Text>
          </div>

          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={refresh}>Atualizar</Button>
            <Button type="primary" onClick={() => message.info("Adicionar pedido (próximo passo)")}>
              Adicionar pedido
            </Button>
          </Space>
        </div>

        {/* abas tipo Woo */}
        <div className="ao__tabs">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ao__tab ${tab === t.key ? "is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} <span className="ao__count">({counts[t.key] || 0})</span>
            </button>
          ))}
        </div>

        {/* filtros */}
        <div className="ao__filters">
          <Space wrap>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 220 }}
              options={[
                { value: "ALL", label: "Todas os status" },
                ...Object.values(ORDER_STATUS).map((s) => ({
                  value: s,
                  label: ORDER_STATUS_LABEL[s],
                })),
              ]}
            />

            <RangePicker
              value={range}
              onChange={setRange}
              format="DD/MM/YYYY"
              placeholder={["Data inicial", "Data final"]}
            />

            <Input
              allowClear
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Pesquisar por pedido, cliente, e-mail..."
              style={{ width: 320 }}
            />

            <Button onClick={() => { setStatusFilter("ALL"); setRange(null); setQ(""); }}>
              Limpar
            </Button>

            <Select
              placeholder="Ações em massa"
              style={{ width: 200 }}
              onChange={bulkAction}
              value={undefined}
              options={[
                { value: "TRASH", label: "Mover para Lixo" },
                { value: "RESTORE", label: "Restaurar (Processando)" },
                { value: "DELETE_HARD", label: "Excluir permanentemente" },
              ]}
            />

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Resetar pedidos (DEV)?",
                  content: "Remove tudo do localStorage e cria mocks de novo.",
                  okText: "Resetar",
                  okButtonProps: { danger: true },
                  cancelText: "Cancelar",
                  onOk: () => {
                    clearOrders();
                    seedOrdersIfEmpty();
                    refresh();
                    message.success("Pedidos resetados.");
                  },
                });
              }}
            >
              Reset DEV
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Card>

      <OrderDetailsDrawer
        open={drawerOpen}
        order={selectedOrder}
        onClose={() => setDrawerOpen(false)}
        onChangeStatus={changeStatus}
      />
    </div>
  );
}
