import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";

import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  seedCustomersIfEmpty,
  updateCustomer,
} from "../../services/customersStore";

import "./admin-customers.css";

const { Title, Text } = Typography;

const SEX_OPTIONS = [
  { value: "N", label: "Não informar" },
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "O", label: "Outro" },
];

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE",
  "PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
].map((uf) => ({ value: uf, label: uf }));

export default function AdminCustomersPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [drawerTab, setDrawerTab] = useState("contato"); // contato | docs | endereco | pessoal

  const [form] = Form.useForm();

  function refresh() {
    setRows(getAllCustomers());
  }

  useEffect(() => {
    seedCustomersIfEmpty();
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows.filter((c) => {
      if (!n) return true;
      return (
        (c.name || "").toLowerCase().includes(n) ||
        (c.email || "").toLowerCase().includes(n) ||
        (c.phone || "").toLowerCase().includes(n) ||
        (c.docNumber || "").toLowerCase().includes(n)
      );
    });
  }, [rows, q]);

  function openCreate() {
    setEditing(null);
    setDrawerTab("contato");
    form.resetFields();
    form.setFieldsValue({
      active: true,

      name: "",
      email: "",
      phone: "",

      docType: "CPF",
      docNumber: "",

      birthDate: "",
      sex: "N",

      address: {
        zip: "",
        street: "",
        number: "",
        district: "",
        city: "",
        state: "SP",
        complement: "",
        reference: "",
      },
    });
    setOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setDrawerTab("contato");
    form.resetFields();
    form.setFieldsValue({
      active: c.active,

      name: c.name,
      email: c.email,
      phone: c.phone,

      docType: c.docType || "CPF",
      docNumber: c.docNumber || "",

      birthDate: c.birthDate || "",
      sex: c.sex || "N",

      address: {
        zip: c.address?.zip || "",
        street: c.address?.street || "",
        number: c.address?.number || "",
        district: c.address?.district || "",
        city: c.address?.city || "",
        state: c.address?.state || "SP",
        complement: c.address?.complement || "",
        reference: c.address?.reference || "",
      },
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

      if (!editing) {
        createCustomer(values);
        message.success("Cliente criado!");
      } else {
        updateCustomer(editing.id, values);
        message.success("Cliente atualizado!");
      }

      refresh();
      closeDrawer();
    } catch (e) {
      if (e?.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function onDelete(c) {
    Modal.confirm({
      title: "Excluir cliente?",
      content: `Excluir “${c.name}” (${c.email})?`,
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => {
        deleteCustomer(c.id);
        refresh();
        message.success("Cliente excluído.");
      },
    });
  }

  function toggleActive(c, checked) {
    updateCustomer(c.id, { active: checked });
    setRows((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: checked } : x)));
  }

  const columns = [
    {
      title: "Cliente",
      key: "client",
      render: (_, c) => (
        <Space direction="vertical" size={0}>
          <Text strong>{c.name || "—"}</Text>
          <Text type="secondary">{c.email}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {c.docType || "CPF"}: {c.docNumber || "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Contato",
      key: "contact",
      width: 220,
      render: (_, c) => (
        <Space direction="vertical" size={0}>
          <Text>{c.phone || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Nasc.: {c.birthDate ? c.birthDate.split("-").reverse().join("/") : "—"} • Sexo:{" "}
            {c.sex === "M" ? "M" : c.sex === "F" ? "F" : c.sex === "O" ? "Outro" : "N/I"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Endereço",
      key: "addr",
      render: (_, c) => {
        const a = c.address || {};
        const line = [a.street, a.number].filter(Boolean).join(", ");
        const city = [a.district, a.city, a.state].filter(Boolean).join(" • ");
        return (
          <Space direction="vertical" size={0}>
            <Text>{line || "—"}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{city || "—"}</Text>
          </Space>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 170,
      render: (_, c) => (
        <Space>
          <Badge status={c.active ? "success" : "default"} text={c.active ? "Ativo" : "Inativo"} />
          <Switch checked={c.active} onChange={(checked) => toggleActive(c, checked)} />
        </Space>
      ),
    },
    {
      title: "Ações",
      key: "actions",
      width: 160,
      render: (_, c) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(c)}>
            Editar
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(c)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="ac">
      <Card bordered={false} className="ac__card">
        <div className="ac__header">
          <div>
            <Title level={3} style={{ margin: 0 }}>Clientes</Title>
            <Text type="secondary">Cadastro e manutenção de clientes (localStorage).</Text>
          </div>

          <Space wrap>
            <Input
              allowClear
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Buscar nome, e-mail, telefone, CPF/CNPJ..."
              style={{ width: 360 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Novo cliente
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title={editing ? "Editar cliente" : "Novo cliente"}
        open={open}
        onClose={closeDrawer}
        width={560}
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
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          {/* Seletor de seção */}
          <Segmented
            block
            value={drawerTab}
            onChange={setDrawerTab}
            options={[
              { label: "Contato", value: "contato" },
              { label: "Documentos", value: "docs" },
              { label: "Pessoal", value: "pessoal" },
              { label: "Endereço", value: "endereco" },
            ]}
          />

          <Divider style={{ margin: 0 }} />

          <Form layout="vertical" form={form} requiredMark={false}>
            <Form.Item label="Ativo" name="active" valuePropName="checked">
              <Switch />
            </Form.Item>

            {/* CONTATO */}
            {drawerTab === "contato" && (
              <>
                <Form.Item
                  label="Nome"
                  name="name"
                  rules={[{ required: true, message: "Informe o nome" }]}
                >
                  <Input placeholder="Nome completo" />
                </Form.Item>

                <Form.Item
                  label="E-mail"
                  name="email"
                  rules={[
                    { required: true, message: "Informe o e-mail" },
                    { type: "email", message: "E-mail inválido" },
                  ]}
                >
                  <Input placeholder="cliente@exemplo.com" />
                </Form.Item>

                <Form.Item
                  label="Celular (WhatsApp)"
                  name="phone"
                  rules={[{ required: true, message: "Informe o celular" }]}
                >
                  <Input placeholder="(xx) xxxxx-xxxx" />
                </Form.Item>
              </>
            )}

            {/* DOCUMENTOS */}
            {drawerTab === "docs" && (
              <>
                <Form.Item label="Tipo" name="docType">
                  <Select
                    options={[
                      { value: "CPF", label: "CPF" },
                      { value: "CNPJ", label: "CNPJ" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="CPF/CNPJ"
                  name="docNumber"
                  rules={[{ required: true, message: "Informe o CPF/CNPJ" }]}
                >
                  <Input placeholder="000.000.000-00 ou 00.000.000/0001-00" />
                </Form.Item>
              </>
            )}

            {/* PESSOAL */}
            {drawerTab === "pessoal" && (
              <>
                <Form.Item label="Data de nascimento" name="birthDate">
                  <Input placeholder="YYYY-MM-DD (ex: 1998-05-10)" />
                </Form.Item>

                <Form.Item label="Sexo" name="sex">
                  <Select options={SEX_OPTIONS} />
                </Form.Item>
              </>
            )}

            {/* ENDEREÇO */}
            {drawerTab === "endereco" && (
              <>
                <Form.Item label="CEP" name={["address", "zip"]}>
                  <Input placeholder="00000-000" />
                </Form.Item>

                <Form.Item label="Rua" name={["address", "street"]}>
                  <Input placeholder="Avenida/Rua" />
                </Form.Item>

                <Space size={12} style={{ width: "100%" }} align="start">
                  <Form.Item label="Número" name={["address", "number"]} style={{ flex: 1 }}>
                    <Input placeholder="123" />
                  </Form.Item>
                  <Form.Item label="Bairro" name={["address", "district"]} style={{ flex: 2 }}>
                    <Input placeholder="Centro" />
                  </Form.Item>
                </Space>

                <Space size={12} style={{ width: "100%" }} align="start">
                  <Form.Item label="Cidade" name={["address", "city"]} style={{ flex: 2 }}>
                    <Input placeholder="Sua cidade" />
                  </Form.Item>
                  <Form.Item label="UF" name={["address", "state"]} style={{ width: 120 }}>
                    <Select options={UF_OPTIONS} />
                  </Form.Item>
                </Space>

                <Form.Item label="Complemento" name={["address", "complement"]}>
                  <Input placeholder="Apto / Bloco / Casa fundos..." />
                </Form.Item>

                <Form.Item label="Ponto de referência" name={["address", "reference"]}>
                  <Input placeholder="Próximo ao..." />
                </Form.Item>
              </>
            )}
          </Form>

          <Text type="secondary">
            Próximo passo: validar CPF/CNPJ, máscara de telefone e busca automática pelo CEP.
          </Text>
        </Space>
      </Drawer>
    </div>
  );
}
