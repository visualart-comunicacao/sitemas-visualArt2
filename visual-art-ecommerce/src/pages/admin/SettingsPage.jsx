import React, { useMemo, useState } from "react";
import {
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Switch,
  Tabs,
  TimePicker,
  Typography,
  Button,
  Upload,
  message,
  Space,
  Select,
  ColorPicker,
  Tooltip,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import "./settings-page.css";

const { Title, Text } = Typography;

const DEFAULT_SETTINGS = {
  business: {
    name: "Minha Loja",
    phone: "",
    email: "",
    address: "",
    logoUrl: "",
    openTime: "09:00",
    closeTime: "18:00",
    defaultMessage: "",
  },
  store: {
    enabled: true,
    minOrder: 0,
    allowPickup: true,
    deliveryFee: 0,
    requireOrderNotes: false,
  },
  appearance: {
    primaryColor: "#1677ff",
    secondaryColor: "#13c2c2",
    showOutOfStock: true,
    layout: "GRID", // "GRID" | "LIST"
    showPrices: true,
  },
  payments: {
    acceptCash: true,
    acceptPix: true,
    acceptCard: true,
    pixKey: "",
    instructions: "",
  },
  advanced: {
    maintenanceMode: false,
  },
};

function safeMerge(base, incoming) {
  const b = base || {};
  const i = incoming || {};
  return {
    ...b,
    ...i,
    business: { ...(b.business || {}), ...(i.business || {}) },
    store: { ...(b.store || {}), ...(i.store || {}) },
    appearance: { ...(b.appearance || {}), ...(i.appearance || {}) },
    payments: { ...(b.payments || {}), ...(i.payments || {}) },
    advanced: { ...(b.advanced || {}), ...(i.advanced || {}) },
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem("visualart:settings");
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return safeMerge(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(data) {
  localStorage.setItem("visualart:settings", JSON.stringify(data));
}

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const initialValues = useMemo(() => loadSettings(), []);

  const normalizedInitial = useMemo(() => {
    const v = initialValues;
    return {
      ...v,
      business: {
        ...v.business,
        openTime: v.business.openTime ? dayjs(v.business.openTime, "HH:mm") : null,
        closeTime: v.business.closeTime ? dayjs(v.business.closeTime, "HH:mm") : null,
      },
    };
  }, [initialValues]);

  const uploadProps = {
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        form.setFieldValue(["business", "logoUrl"], dataUrl);
        message.success("Logo atualizada (prévia).");
      };
      reader.readAsDataURL(file);
      return false; // impede upload automático
    },
  };

  const onReset = () => {
    form.setFieldsValue({
      ...DEFAULT_SETTINGS,
      business: {
        ...DEFAULT_SETTINGS.business,
        openTime: dayjs(DEFAULT_SETTINGS.business.openTime, "HH:mm"),
        closeTime: dayjs(DEFAULT_SETTINGS.business.closeTime, "HH:mm"),
      },
    });
    message.info("Restaurado para padrão (ainda não salvo).");
  };

  const onSubmit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // Converte TimePicker (dayjs) -> string
      const open = values?.business?.openTime?.isValid?.()
        ? values.business.openTime.format("HH:mm")
        : DEFAULT_SETTINGS.business.openTime;

      const close = values?.business?.closeTime?.isValid?.()
        ? values.business.closeTime.format("HH:mm")
        : DEFAULT_SETTINGS.business.closeTime;

      const payload = {
        ...values,
        business: {
          ...values.business,
          openTime: open,
          closeTime: close,
        },
      };

      saveSettings(payload);
      message.success("Configurações salvas.");
    } catch (err) {
      // err.errorFields existe quando validação falha
      if (err?.errorFields?.length) message.error("Revise os campos obrigatórios.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      key: "business",
      label: "Negócio",
      children: (
        <Card className="settings-card" title="Dados do negócio" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Nome da loja/empresa"
                name={["business", "name"]}
                rules={[{ required: true, message: "Informe o nome." }]}
              >
                <Input placeholder="Ex: Visual Art Papelaria" />
              </Form.Item>

              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Telefone/WhatsApp" name={["business", "phone"]}>
                    <Input placeholder="(xx) xxxxx-xxxx" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="E-mail"
                    name={["business", "email"]}
                    rules={[{ type: "email", message: "E-mail inválido." }]}
                  >
                    <Input placeholder="contato@..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Endereço" name={["business", "address"]}>
                <Input placeholder="Rua, nº, bairro, cidade" />
              </Form.Item>

              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Abre às" name={["business", "openTime"]}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Fecha às" name={["business", "closeTime"]}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} md={8}>
              <Card className="settings-subcard" title="Logo" size="small">
                <Form.Item name={["business", "logoUrl"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {() => {
                    const logoUrl = form.getFieldValue(["business", "logoUrl"]);
                    return (
                      <div className="settings-logoBox">
                        {logoUrl ? (
                          <img className="settings-logoImg" src={logoUrl} alt="Logo" />
                        ) : (
                          <div className="settings-logoPlaceholder">
                            <Text type="secondary">Sem logo</Text>
                          </div>
                        )}

                        <div className="settings-logoActions">
                          <Upload {...uploadProps}>
                            <Button block>Enviar logo</Button>
                          </Upload>
                          <Button
                            block
                            danger
                            onClick={() => form.setFieldValue(["business", "logoUrl"], "")}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </Card>

              <Divider />

              <Form.Item label="Mensagem padrão" name={["business", "defaultMessage"]}>
                <Input.TextArea
                  rows={4}
                  placeholder="Ex: Pedidos confirmados via WhatsApp. Horário de atendimento..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },

    {
      key: "store",
      label: "Loja",
      children: (
        <Card className="settings-card" title="Configurações da loja" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Loja online ativa" name={["store", "enabled"]} valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Pedido mínimo (R$)" name={["store", "minOrder"]}>
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Taxa de entrega (R$)" name={["store", "deliveryFee"]}>
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Permitir retirada no local"
                name={["store", "allowPickup"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label={
                  <Tooltip title="Exige que o cliente escreva uma observação antes de finalizar.">
                    Observações obrigatórias no pedido
                  </Tooltip>
                }
                name={["store", "requireOrderNotes"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Card className="settings-subcard" title="Categorias (atalho)" size="small">
            <Text type="secondary">
              Estrutura pronta. Aqui você chama o modal de categorias (vamos implementar depois).
            </Text>
            <div style={{ marginTop: 12 }}>
              <Button type="primary">Gerenciar categorias</Button>
            </div>
          </Card>
        </Card>
      ),
    },

    {
      key: "appearance",
      label: "Aparência",
      children: (
        <Card className="settings-card" title="Aparência da loja" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Cor primária" name={["appearance", "primaryColor"]}>
                <ColorPicker
                  showText
                  onChange={(_, hex) => form.setFieldValue(["appearance", "primaryColor"], hex)}
                />
              </Form.Item>

              <Form.Item label="Cor secundária" name={["appearance", "secondaryColor"]}>
                <ColorPicker
                  showText
                  onChange={(_, hex) => form.setFieldValue(["appearance", "secondaryColor"], hex)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Mostrar produtos sem estoque"
                name={["appearance", "showOutOfStock"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Mostrar preços"
                name={["appearance", "showPrices"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item label="Layout de listagem" name={["appearance", "layout"]}>
                <Select
                  options={[
                    { label: "Grid", value: "GRID" },
                    { label: "Lista", value: "LIST" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },

    {
      key: "payments",
      label: "Pagamentos",
      children: (
        <Card className="settings-card" title="Pagamentos" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Aceita dinheiro"
                name={["payments", "acceptCash"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Aceita PIX"
                name={["payments", "acceptPix"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item label="Chave PIX" name={["payments", "pixKey"]}>
                <Input placeholder="CPF / e-mail / telefone / aleatória" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Aceita cartão"
                name={["payments", "acceptCard"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item label="Instruções" name={["payments", "instructions"]}>
                <Input.TextArea rows={4} placeholder="Ex: Envie o comprovante no WhatsApp..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },

    {
      key: "advanced",
      label: "Avançado",
      children: (
        <Card className="settings-card" title="Avançado" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Modo manutenção"
                name={["advanced", "maintenanceMode"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Text type="secondary">
                Futuro: bloquear a loja do cliente quando estiver ativo.
              </Text>
            </Col>

            <Col xs={24} md={12}>
              <Card className="settings-subcard" title="Ações" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Popconfirm
                    title="Limpar dados locais?"
                    description="Remove settings salvas no navegador (MVP)."
                    okText="Sim"
                    cancelText="Não"
                    onConfirm={() => {
                      localStorage.removeItem("visualart:settings");
                      form.setFieldsValue({
                        ...DEFAULT_SETTINGS,
                        business: {
                          ...DEFAULT_SETTINGS.business,
                          openTime: dayjs(DEFAULT_SETTINGS.business.openTime, "HH:mm"),
                          closeTime: dayjs(DEFAULT_SETTINGS.business.closeTime, "HH:mm"),
                        },
                      });
                      message.success("Dados locais removidos.");
                    }}
                  >
                    <Button danger block>
                      Limpar dados locais
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Configurações
          </Title>
          <Text type="secondary">Preferências do sistema, loja e identidade.</Text>
        </div>

        <div className="settings-actions">
          <Button onClick={onReset}>Restaurar padrão</Button>
          <Button type="primary" loading={saving} onClick={onSubmit}>
            Salvar
          </Button>
        </div>
      </div>

      <Form layout="vertical" form={form} initialValues={normalizedInitial}>
        <Tabs items={tabs} />
      </Form>
    </div>
  );
}
