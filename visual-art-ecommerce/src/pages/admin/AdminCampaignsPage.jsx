import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { deleteCampaign, loadCampaigns, saveCampaigns, upsertCampaign } from "../../services/campaigns.storage";
import "./admin-campaigns.css";

function uid() {
  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

export default function AdminCampaignsPage() {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setItems(loadCampaigns());

  useEffect(() => {
    refresh();
  }, []);

  const uploadProps = {
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        form.setFieldValue("imageUrl", dataUrl);
        message.success("Arte carregada.");
      };
      reader.readAsDataURL(file);
      return false;
    },
  };

  const columns = useMemo(
    () => [
      {
        title: "Arte",
        dataIndex: "imageUrl",
        width: 110,
        render: (v) =>
          v ? <Image src={v} width={90} height={56} style={{ objectFit: "cover", borderRadius: 10 }} /> : "-",
      },
      { title: "Título", dataIndex: "title" },
      {
        title: "Tipo",
        dataIndex: "type",
        width: 110,
        render: (t) => (t === "HERO" ? <Tag color="blue">BANNER</Tag> : <Tag color="green">PROMO</Tag>),
      },
      {
        title: "Ativo",
        dataIndex: "active",
        width: 90,
        render: (v) => (v ? <Tag color="green">SIM</Tag> : <Tag>Não</Tag>),
      },
      { title: "Ordem", dataIndex: "order", width: 80 },
      {
        title: "Ações",
        key: "actions",
        width: 160,
        render: (_, row) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(row);
                form.setFieldsValue(row);
                setOpen(true);
              }}
            >
              Editar
            </Button>

            <Popconfirm
              title="Excluir campanha?"
              okText="Excluir"
              cancelText="Cancelar"
              onConfirm={() => {
                deleteCampaign(row.id);
                message.success("Campanha excluída.");
                refresh();
              }}
            >
              <Button danger icon={<DeleteOutlined />}>
                Excluir
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [form]
  );

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      type: "HERO",
      active: true,
      order: 1,
      linkType: "NONE",
    });
    setOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    const payload = {
      id: editing?.id || uid(),
      title: values.title,
      type: values.type,
      imageUrl: values.imageUrl || "",
      active: !!values.active,
      order: Number(values.order || 1),
      linkType: values.linkType || "NONE",
      linkValue: values.linkValue || "",
    };

    upsertCampaign(payload);
    message.success(editing ? "Campanha atualizada." : "Campanha criada.");
    setOpen(false);
    refresh();
  };

  const onToggleActive = (id, active) => {
    const list = loadCampaigns().map((c) => (c.id === id ? { ...c, active } : c));
    saveCampaigns(list);
    setItems(list);
  };

  return (
    <div className="admin-campaigns">
      <div className="admin-campaigns__header">
        <div>
          <h2>Campanhas</h2>
          <p className="muted">Crie o banner principal e as promoções da Home.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Nova campanha
        </Button>
      </div>

      <Card bordered={false} className="admin-campaigns__card">
        <Table
          rowKey="id"
          dataSource={[...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
          columns={columns}
          pagination={{ pageSize: 8 }}
          expandable={{
            expandedRowRender: (row) => (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="muted">Ativar/desativar:</span>
                <Switch checked={!!row.active} onChange={(v) => onToggleActive(row.id, v)} />
                <span className="muted">
                  Link: {row.linkType} {row.linkValue ? `→ ${row.linkValue}` : ""}
                </span>
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title={editing ? "Editar campanha" : "Nova campanha"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        okText="Salvar"
        cancelText="Cancelar"
        width={780}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Título"
                name="title"
                rules={[{ required: true, message: "Informe o título." }]}
              >
                <Input placeholder="Ex: Volta às aulas - até 30% OFF" />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item label="Tipo" name="type" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { label: "Banner grande (topo)", value: "HERO" },
                        { label: "Promo quadrada (abaixo)", value: "PROMO" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Ordem" name="order">
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item label="Ativo" name="active" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item label="Tipo de link" name="linkType">
                    <Select
                      options={[
                        { label: "Sem link", value: "NONE" },
                        { label: "Produto (id)", value: "PRODUCT" },
                        { label: "Categoria (nome/id)", value: "CATEGORY" },
                        { label: "URL externa", value: "URL" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Valor do link" name="linkValue">
                    <Input placeholder="Ex: 123 | Cadernos | https://..." />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="Arte" bordered={false}>
                <Form.Item name="imageUrl" hidden>
                  <Input />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {() => {
                    const url = form.getFieldValue("imageUrl");
                    return (
                      <div style={{ display: "grid", gap: 12 }}>
                        {url ? (
                          <Image src={url} style={{ borderRadius: 12 }} />
                        ) : (
                          <div className="campaign-placeholder">Sem arte</div>
                        )}

                        <Upload {...uploadProps}>
                          <Button block icon={<UploadOutlined />}>
                            Enviar arte
                          </Button>
                        </Upload>

                        <Button block danger onClick={() => form.setFieldValue("imageUrl", "")}>
                          Remover
                        </Button>

                        <div className="muted" style={{ fontSize: 12 }}>
                          Dica: banner topo ~ 1200x360 | promo ~ 600x600
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
