import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import {
  clearProducts,
  createProduct,
  deleteProduct,
  getAllProducts,
  seedProductsIfEmpty,
  updateProduct,
} from "../../services/productsStore";
import "./admin-products.css";

const { Title, Text } = Typography;

const CATEGORIES = [
  { value: "BANNERS", label: "Banners" },
  { value: "PLACAS", label: "Placas" },
  { value: "ADESIVOS", label: "Adesivos" },
  { value: "CANECA", label: "Canecas" },
  { value: "CAMISETAS", label: "Camisetas" },
  { value: "PERSONALIZADOS", label: "Personalizados" },
  { value: "BONES", label: "Bonés" },
];

function formatBRL(v) {
  if (typeof v !== "number") return "-";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminProductsPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  // drawer
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product or null
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  function refresh() {
    const all = getAllProducts();
    setRows(all);
  }

  useEffect(() => {
    seedProductsIfEmpty();
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows.filter((p) => {
      const matchCat = cat === "ALL" ? true : p.category === cat;
      const matchQuery =
        !n ||
        p.title.toLowerCase().includes(n) ||
        (p.desc || "").toLowerCase().includes(n) ||
        (p.categoryLabel || "").toLowerCase().includes(n);
      return matchCat && matchQuery;
    });
  }, [rows, q, cat]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      title: "",
      category: "BANNERS",
      categoryLabel: "Banners",
      desc: "",
      priceFrom: 0,
      imageUrl: "",
      active: true,
      featured: false,
    });
    setOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    form.resetFields();
    form.setFieldsValue({
      title: product.title,
      category: product.category,
      categoryLabel: product.categoryLabel,
      desc: product.desc,
      priceFrom: product.priceFrom,
      imageUrl: product.imageUrl,
      active: product.active,
      featured: product.featured,
    });
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  }

  async function onSubmit() {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // categoryLabel auto (se usuário não mexer)
      const catLabel =
        values.categoryLabel ||
        CATEGORIES.find((c) => c.value === values.category)?.label ||
        values.category;

      const payload = { ...values, categoryLabel: catLabel };

      if (!editing) {
        createProduct(payload);
        message.success("Produto criado!");
      } else {
        updateProduct(editing.id, payload);
        message.success("Produto atualizado!");
      }

      refresh();
      closeDrawer();
    } finally {
      setSaving(false);
    }
  }

  function onDelete(product) {
    Modal.confirm({
      title: "Excluir produto?",
      content: `Você tem certeza que deseja excluir “${product.title}”?`,
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => {
        deleteProduct(product.id);
        message.success("Produto excluído.");
        refresh();
      },
    });
  }

  function toggleActive(product, checked) {
    updateProduct(product.id, { active: checked });
    setRows((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: checked } : p))
    );
    message.success(checked ? "Produto ativado" : "Produto inativado");
 }

  const columns = [
    {
      title: "Produto",
      key: "product",
      render: (_, p) => (
        <Space>
          <div className="ap__thumb">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.title}
                width={44}
                height={44}
                style={{ borderRadius: 12, objectFit: "cover" }}
                preview={false}
              />
            ) : (
              <div className="ap__thumbFallback">IMG</div>
            )}
          </div>
          <div>
            <div className="ap__titleRow">
              <Text strong>{p.title}</Text>
              {p.featured && <Tag color="green">Destaque</Tag>}
              {!p.active && <Tag color="default">Inativo</Tag>}
            </div>
            <Text type="secondary" className="ap__desc">
              {p.desc || "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Categoria",
      dataIndex: "categoryLabel",
      key: "categoryLabel",
      width: 140,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Preço",
      dataIndex: "priceFrom",
      key: "priceFrom",
      width: 140,
      render: (v) => <Text strong>{formatBRL(v)}</Text>,
    },
    {
      title: "Ativo",
      key: "active",
      width: 180,
      render: (_, p) => (
        <Space>
          <Badge
            status={p.active ? "success" : "default"}
            text={p.active ? "Ativo" : "Inativo"}
          />
          <Switch
            checked={p.active}
            onChange={(checked) => toggleActive(p, checked)}
          />
        </Space>
      ),
    },
    {
      title: "Ações",
      key: "actions",
      width: 160,
      render: (_, p) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(p)}>
            Editar
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(p)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="ap">
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Card bordered={false} className="ap__headerCard">
          <div className="ap__header">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Produtos
              </Title>
            </div>

            <Space wrap>
              <Input
                allowClear
                value={q}
                onChange={(e) => setQ(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Buscar produto..."
                style={{ width: 260 }}
              />

              <Select
                value={cat}
                onChange={setCat}
                style={{ width: 170 }}
                options={[
                  { value: "ALL", label: "Todas categorias" },
                  ...CATEGORIES,
                ]}
              />

              <Button icon={<ReloadOutlined />} onClick={refresh}>
                Atualizar
              </Button>

              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Novo produto
              </Button>
            </Space>
          </div>
        </Card>

        <Card bordered={false} className="ap__tableCard">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 8 }}
          />
          <div className="ap__footerActions">
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Limpar tudo?",
                  content:
                    "Isso remove todos os produtos salvos localmente (localStorage).",
                  okText: "Limpar",
                  okButtonProps: { danger: true },
                  cancelText: "Cancelar",
                  onOk: () => {
                    clearProducts();
                    seedProductsIfEmpty();
                    refresh();
                    message.success("Produtos resetados.");
                  },
                });
              }}
            >
              Resetar produtos (DEV)
            </Button>
          </div>
        </Card>
      </Space>

      <Drawer
        title={editing ? "Editar produto" : "Novo produto"}
        open={open}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancelar</Button>
            <Button type="primary" loading={saving} onClick={onSubmit}>
              Salvar
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} requiredMark={false}>
          <Form.Item
            label="Nome do produto"
            name="title"
            rules={[{ required: true, message: "Informe o nome do produto" }]}
          >
            <Input placeholder="Ex: Banner Lona 440g" />
          </Form.Item>

          <Form.Item
            label="Categoria"
            name="category"
            rules={[{ required: true, message: "Selecione uma categoria" }]}
          >
            <Select
              options={CATEGORIES}
              onChange={(val) => {
                const label = CATEGORIES.find((c) => c.value === val)?.label || val;
                form.setFieldValue("categoryLabel", label);
              }}
            />
          </Form.Item>

          {/* Mantém o label separado (bom pra exibição) */}
          <Form.Item label="Categoria (label)" name="categoryLabel">
            <Input placeholder="Ex: Banners" />
          </Form.Item>

          <Form.Item label="Descrição" name="desc">
            <Input.TextArea rows={3} placeholder="Descreva o produto..." />
          </Form.Item>

          <Form.Item label="Preço inicial (a partir de)" name="priceFrom">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={1}
              addonBefore="R$"
            />
          </Form.Item>

          <Form.Item label="Imagem (URL)" name="imageUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <Space size={18}>
            <Form.Item label="Ativo" name="active" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Destaque" name="featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <div className="ap__hint">
            <Text type="secondary">
              Dica: por enquanto é URL. Depois a gente coloca upload real no admin.
            </Text>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
