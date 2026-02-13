import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Segmented,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  IdcardOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../services/customersStore";
import { useAuth } from "../context/AuthContext";
import "./login-page.css";

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form] = Form.useForm();
  const [step, setStep] = useState("contato");
  const [saving, setSaving] = useState(false);

  const stepFields = useMemo(() => {
    return {
      contato: ["name", "email", "phone"],
      docs: ["docType", "docNumber"],
      pessoal: ["birthDate", "sex"],
      endereco: [
        ["address", "zip"],
        ["address", "street"],
        ["address", "number"],
        ["address", "district"],
        ["address", "city"],
        ["address", "state"],
        ["address", "complement"],
        ["address", "reference"],
      ],
    };
  }, []);

  async function nextStep() {
    try {
      await form.validateFields(stepFields[step]);

      const order = ["contato", "docs", "pessoal", "endereco"];
      const idx = order.indexOf(step);
      if (idx < order.length - 1) setStep(order[idx + 1]);
    } catch {
      // o antd já mostra os erros
    }
  }

  function prevStep() {
    const order = ["contato", "docs", "pessoal", "endereco"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  async function onSubmit() {
    try {
      setSaving(true);

      // 1) valida tudo que existe no form
      await form.validateFields();

      // 2) pega TODOS os valores (inclusive campos de steps anteriores desmontados)
      const values = form.getFieldsValue(true);

      const customer = createCustomer({
        ...values,
        active: true,
      });

      // login automático como CLIENTE
      setUser({ name: customer.name, role: "CLIENTE", email: customer.email });

      message.success("Conta criada! Bem-vindo(a) 😊");
      navigate("/produtos");
    } catch (e) {
      if (e?.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="login">
      <div className="login__bg" />

      <div className="login__container">
        {/* Coluna esquerda (branding) */}
        <div className="login__left">
          <div className="login__brand">
            <div className="login__logo">
              <img src="/img/favicon.png" alt="" style={{ maxWidth: "100px" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Visual Art - Loja
              </Title>
              <Text type="secondary">Cadastro do cliente</Text>
            </div>
          </div>

          <div className="login__headline">
            <Title className="login__title">
              Crie sua conta e acompanhe pedidos, orçamentos e carrinho.
            </Title>
            <Text className="login__subtitle">
              Em poucos passos você se cadastra e já pode comprar com mais rapidez.
            </Text>
          </div>

          <div className="login__chips">
            <span className="login__chip">✅ Histórico de pedidos</span>
            <span className="login__chip">✅ Endereço salvo</span>
            <span className="login__chip">✅ Atendimento via WhatsApp</span>
          </div>
        </div>

        {/* Coluna direita (form) */}
        <div className="login__right">
          <Card className="login__card" bordered={false}>
            <div className="login__cardHeader">
              <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
                <div>
                  <Title level={3} style={{ marginBottom: 6 }}>
                    Criar conta
                  </Title>
                  <Text type="secondary">Preencha seus dados para continuar.</Text>
                </div>

                <Button type="link" onClick={() => navigate("/entrar")}>
                  Já tenho conta
                </Button>
              </Space>
            </div>

            <Segmented
              block
              value={step}
              onChange={setStep}
              options={[
                { label: "Contato", value: "contato" },
                { label: "Documentos", value: "docs" },
                { label: "Pessoal", value: "pessoal" },
                { label: "Endereço", value: "endereco" },
              ]}
            />

            <Divider style={{ margin: "12px 0" }} />

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              preserve
              initialValues={{
                docType: "CPF",
                sex: "N",
                address: { state: "SP" },
              }}
            >
              {/* CONTATO */}
              {step === "contato" && (
                <>
                  <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: "Informe seu nome" }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined />}
                      placeholder="Seu nome completo"
                    />
                  </Form.Item>

                  <Form.Item
                    label="E-mail"
                    name="email"
                    rules={[
                      { required: true, message: "Informe seu e-mail" },
                      { type: "email", message: "E-mail inválido" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined />}
                      placeholder="seuemail@exemplo.com"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Celular (WhatsApp)"
                    name="phone"
                    rules={[{ required: true, message: "Informe seu celular" }]}
                  >
                    <Input
                      size="large"
                      prefix={<PhoneOutlined />}
                      placeholder="(xx) xxxxx-xxxx"
                    />
                  </Form.Item>
                </>
              )}

              {/* DOCS */}
              {step === "docs" && (
                <>
                  <Form.Item label="Tipo de documento" name="docType">
                    <Select
                      size="large"
                      options={[
                        { value: "CPF", label: "CPF" },
                        { value: "CNPJ", label: "CNPJ" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="CPF/CNPJ"
                    name="docNumber"
                    rules={[{ required: true, message: "Informe seu CPF/CNPJ" }]}
                  >
                    <Input
                      size="large"
                      prefix={<IdcardOutlined />}
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    />
                  </Form.Item>
                </>
              )}

              {/* PESSOAL */}
              {step === "pessoal" && (
                <>
                  <Form.Item label="Data de nascimento" name="birthDate">
                    <Input size="large" placeholder="YYYY-MM-DD (ex: 1998-05-10)" />
                  </Form.Item>

                  <Form.Item label="Sexo" name="sex">
                    <Select size="large" options={SEX_OPTIONS} />
                  </Form.Item>
                </>
              )}

              {/* ENDEREÇO */}
              {step === "endereco" && (
                <>
                  <Form.Item label="CEP" name={["address", "zip"]}>
                    <Input size="large" prefix={<HomeOutlined />} placeholder="00000-000" />
                  </Form.Item>

                  <Form.Item label="Rua" name={["address", "street"]}>
                    <Input size="large" placeholder="Avenida/Rua" />
                  </Form.Item>

                  <Space size={12} style={{ width: "100%" }} align="start">
                    <Form.Item label="Número" name={["address", "number"]} style={{ flex: 1 }}>
                      <Input size="large" placeholder="123" />
                    </Form.Item>
                    <Form.Item label="Bairro" name={["address", "district"]} style={{ flex: 2 }}>
                      <Input size="large" placeholder="Centro" />
                    </Form.Item>
                  </Space>

                  <Space size={12} style={{ width: "100%" }} align="start">
                    <Form.Item label="Cidade" name={["address", "city"]} style={{ flex: 2 }}>
                      <Input size="large" placeholder="Sua cidade" />
                    </Form.Item>
                    <Form.Item label="UF" name={["address", "state"]} style={{ width: 120 }}>
                      <Select size="large" options={UF_OPTIONS} />
                    </Form.Item>
                  </Space>

                  <Form.Item label="Complemento" name={["address", "complement"]}>
                    <Input size="large" placeholder="Apto / Bloco / Casa fundos..." />
                  </Form.Item>

                  <Form.Item label="Ponto de referência" name={["address", "reference"]}>
                    <Input size="large" placeholder="Próximo ao..." />
                  </Form.Item>
                </>
              )}

              <div
                className="login__actions"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button icon={<ArrowLeftOutlined />} onClick={prevStep} disabled={step === "contato"}>
                  Voltar
                </Button>

                {step !== "endereco" ? (
                  <Button type="primary" icon={<ArrowRightOutlined />} onClick={nextStep}>
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    loading={saving}
                    onClick={onSubmit}
                  >
                    Criar conta
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
