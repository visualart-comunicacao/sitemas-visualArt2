import React from "react";
import { Badge, Button, Descriptions, Divider, Drawer, Space, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { ORDER_STATUS, ORDER_STATUS_LABEL } from "../../services/ordersStore";

const { Title, Text } = Typography;

function brl(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusMeta(status) {
  const map = {
    [ORDER_STATUS.PENDING_PAYMENT]: { badge: "warning", icon: <ClockCircleOutlined />, color: "gold" },
    [ORDER_STATUS.PROCESSING]: { badge: "processing", icon: <ClockCircleOutlined />, color: "blue" },
    [ORDER_STATUS.ON_HOLD]: { badge: "default", icon: <ClockCircleOutlined />, color: "default" },
    [ORDER_STATUS.COMPLETED]: { badge: "success", icon: <CheckCircleOutlined />, color: "green" },
    [ORDER_STATUS.FAILED]: { badge: "error", icon: <CloseCircleOutlined />, color: "red" },
    [ORDER_STATUS.TRASH]: { badge: "default", icon: <DeleteOutlined />, color: "default" },
  };
  return map[status] || { badge: "default", icon: null, color: "default" };
}

export default function OrderDetailsDrawer({ open, order, onClose, onChangeStatus }) {
  if (!order) return null;

  const meta = statusMeta(order.status);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={
        <Space direction="vertical" size={2}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Pedido #{order.id}
            </Title>
            <Badge status={meta.badge} text={ORDER_STATUS_LABEL[order.status]} />
          </Space>
          <Text type="secondary">{order.customerEmail}</Text>
        </Space>
      }
      extra={
        <Button onClick={onClose}>
          Fechar
        </Button>
      }
      destroyOnClose
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <div>
          <Text type="secondary">Status atual</Text>
          <div style={{ marginTop: 6 }}>
            <Tag color={meta.color} style={{ borderRadius: 999, padding: "4px 10px" }}>
              {meta.icon} {ORDER_STATUS_LABEL[order.status]}
            </Tag>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <Text type="secondary">Alterar status</Text>
          <Space wrap style={{ marginTop: 10 }}>
            <Button onClick={() => onChangeStatus(order.id, ORDER_STATUS.PENDING_PAYMENT)}>
              Pagamento pendente
            </Button>
            <Button onClick={() => onChangeStatus(order.id, ORDER_STATUS.PROCESSING)}>
              Processando
            </Button>
            <Button onClick={() => onChangeStatus(order.id, ORDER_STATUS.ON_HOLD)}>
              Aguardando
            </Button>
            <Button type="primary" onClick={() => onChangeStatus(order.id, ORDER_STATUS.COMPLETED)}>
              Concluído
            </Button>
            <Button danger onClick={() => onChangeStatus(order.id, ORDER_STATUS.FAILED)}>
              Falhado
            </Button>
            <Button onClick={() => onChangeStatus(order.id, ORDER_STATUS.TRASH)}>
              Lixo
            </Button>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        <Descriptions
          title="Resumo"
          bordered
          column={1}
          size="small"
          labelStyle={{ width: 160 }}
        >
          <Descriptions.Item label="Cliente">
            {order.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="E-mail">
            {order.customerEmail}
          </Descriptions.Item>
          <Descriptions.Item label="Itens">
            {order.itemsCount} {order.itemsCount === 1 ? "item" : "itens"}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            <Text strong>{brl(order.total)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Pagamento">
            {order.paymentMethod || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Enviar para">
            {order.shippingTo || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Drawer>
  );
}
