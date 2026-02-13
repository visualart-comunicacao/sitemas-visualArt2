import React from "react";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { LockOutlined, MailOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login-page.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  async function onFinish(values) {
    const { email, password } = values;

    // 👇 agora preparado pra backend no futuro
    const res = await login(email, password);

    if (!res.ok) {
      message.error(res.message);
      return;
    }

    message.success("Login realizado!");

    // 👇 redireciona conforme role
    navigate(res.role === "ADMIN" ? "/admin/dashboard" : "/produtos");
  }

  return (
    <div className="login">
      <div className="login__bg" />

      <div className="login__container">
        {/* esquerda */}
        <div className="login__left">
          <div className="login__brand">
            <div className="login__logo">
              <img src="/img/favicon.png" alt="" style={{ maxWidth: "100px" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Visual Art - Loja</Title>
              <Text type="secondary">Comunicação visual premium</Text>
            </div>
          </div>

          <div className="login__headline">
            <Title className="login__title">
              Faça login e finalize seus pedidos com mais agilidade.
            </Title>
            <Text className="login__subtitle">
              Acesse sua conta para acompanhar orçamentos, pedidos e seu carrinho.
            </Text>
          </div>

          <div className="login__chips">
            <span className="login__chip">✅ Orçamentos rápidos</span>
            <span className="login__chip">✅ Catálogo atualizado</span>
            <span className="login__chip">✅ Suporte via WhatsApp</span>
          </div>
        </div>

        {/* direita */}
        <div className="login__right">
          <Card className="login__card" bordered={false}>
            <div className="login__cardHeader">
              <Title level={3} style={{ marginBottom: 6 }}>
                Entrar
              </Title>
              <Text type="secondary">
                Use seu e-mail e senha para continuar.
              </Text>
            </div>

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
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
                label="Senha"
                name="password"
                rules={[{ required: true, message: "Informe sua senha" }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Sua senha"
                />
              </Form.Item>

              <div className="login__actions">
                <Button type="link" onClick={() => message.info("Implementar recuperação")}>
                  Esqueci minha senha
                </Button>
              </div>

              <Space direction="horizontal" style={{ width: "100%", textAlign: "right" }} size={12}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  className="login__btn"
                  icon={<ArrowRightOutlined />}
                >
                  Entrar
                </Button>

                <Button size="large" onClick={() => navigate("/cadastrar")}>
                  Criar conta
                </Button>
              </Space>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
