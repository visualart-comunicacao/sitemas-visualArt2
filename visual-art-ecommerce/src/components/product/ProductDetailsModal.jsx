import React from "react";
import {
  Modal,
  Button,
  Divider,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./product-details-modal.css";

const { Title, Paragraph, Text } = Typography;

function buildWhatsAppLink(product) {
  const whatsappNumber = "5511999999999"; // <- troque
  const text = `Olá! Quero um orçamento para: ${product.title}.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export default function ProductDetailsModal({ open, product, onClose }) {
  const { isLoggedIn, role } = useAuth();
  const { addOne } = useCart();

  if (!product) return null;

  console.log({ product });

  const isClient = isLoggedIn && role === "CLIENTE";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      destroyOnClose
      className="pdModal"
    >
      <div className="pdModal__wrap">
        {/* esquerda */}
        <div className="pdModal__left">
          <div className="pdModal__media">
            <div className="pdModal__bigIcon">
              <img
                      src={product.imageUrl}
                      alt={product.title}
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 20,
                        objectFit: "cover",
                      }}
                    />
            </div>
          </div>
        </div>

        {/* direita */}
        <div className="pdModal__right">
          <Tag color="green" className="pdModal__tag">
            {product.categoryLabel}
          </Tag>

          <Title level={3} className="pdModal__title">
            {product.title}
          </Title>

          <Paragraph className="pdModal__desc">
            {product.desc}
          </Paragraph>

          {!!product.specs?.length && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <div className="pdModal__specs">
                {product.specs.map((s, i) => (
                  <div key={i} className="pdModal__spec">
                    <Text className="pdModal__specLabel">{s.label}</Text>
                    <Text className="pdModal__specValue">{s.value}</Text>
                  </div>
                ))}
              </div>
            </>
          )}

          <Divider style={{ margin: "14px 0" }} />

          <Space wrap>
            <Button
              size="large"
              className="pdModal__wa"
              icon={<WhatsAppOutlined />}
              onClick={() =>
                window.open(buildWhatsAppLink(product), "_blank")
              }
            >
              Solicitar no WhatsApp
            </Button>

            {isClient && (
              <Button
                size="large"
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  addOne();
                  message.success("Adicionado ao carrinho");
                }}
              >
                Adicionar
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
}
