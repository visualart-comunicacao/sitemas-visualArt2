import { useEffect, useMemo, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Space,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Divider,
  InputNumber,
  message,
  Affix,
} from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { listCustomers } from '@/api/customers.api'
import { createQuote, getQuote, updateQuote } from '@/api/quotes.api'
import { parseBRLToCents, formatCentsBRL } from '@/shared/utils/money'
import ProductPickerModal from '../components/ProductPickerModal'

const { Title, Text } = Typography

export default function QuoteEditPage({ mode = 'create' }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const [customersLoading, setCustomersLoading] = useState(false)
  const [customers, setCustomers] = useState([])

  const [preview, setPreview] = useState({
    subtotalCents: 0,
    totalCents: 0,
  })

  // ===== Product Picker =====
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTargetIndex, setPickerTargetIndex] = useState(null)

  function openPickerForItem(index) {
    setPickerTargetIndex(index)
    setPickerOpen(true)
  }

  function handlePickProduct(product) {
    if (pickerTargetIndex == null) return

    const label = [product?.name, product?.description].filter(Boolean).join(' — ')

    const items = form.getFieldValue('items') || []

    items[pickerTargetIndex] = {
      ...items[pickerTargetIndex],
      productId: product.id, // 👈 backend
      productLabel: label, // 👈 UI
    }

    form.setFieldsValue({ items })

    setPickerOpen(false)
    setPickerTargetIndex(null)

    message.success(`Produto selecionado: ${product.name}`)
  }

  // ===== Load customers =====
  async function loadCustomers(search = '') {
    try {
      setCustomersLoading(true)
      const res = await listCustomers({ search, page: 1, pageSize: 20 })
      setCustomers(res?.data || res || [])
    } catch (err) {
      message.error('Erro ao carregar clientes.')
    } finally {
      setCustomersLoading(false)
    }
  }

  // ===== Load quote (edit) =====
  async function loadQuote() {
    if (!isEdit || !id) return

    try {
      setLoading(true)
      const q = await getQuote(id)

      form.setFieldsValue({
        customerUserId: q.userId,
        notes: q.notes,
        internalNotes: q.internalNotes,
        discount: ((q.discountCents || 0) / 100).toFixed(2).replace('.', ','),
        shipping: ((q.shippingCents || 0) / 100).toFixed(2).replace('.', ','),
        tax: ((q.taxCents || 0) / 100).toFixed(2).replace('.', ','),
        items: (q.items || []).map((it) => ({
          productId: it.productId,
          productLabel: it.name, // snapshot salvo no backend
          quantity: it.quantity,
          width: it.width,
          height: it.height,
          optionIds: it.optionIds || [],
        })),
      })

      setPreview({
        subtotalCents: q.subtotalCents || 0,
        totalCents: q.totalCents || 0,
      })
    } catch (err) {
      message.error('Erro ao carregar orçamento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers('')
    loadQuote()
    // eslint-disable-next-line
  }, [])

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        label: `${c.name}${c.phone ? ` • ${c.phone}` : ''}`,
        value: c.id,
      })),
    [customers],
  )

  // ===== Save =====
  async function onSave() {
    try {
      const v = await form.validateFields()
      setLoading(true)

      const payload = {
        customerUserId: v.customerUserId,
        notes: v.notes || null,
        internalNotes: v.internalNotes || null,
        discountCents: parseBRLToCents(v.discount),
        shippingCents: parseBRLToCents(v.shipping),
        taxCents: parseBRLToCents(v.tax),
        items: (v.items || []).map((it) => ({
          productId: it.productId,
          quantity: Number(it.quantity || 1),
          width: it.width ?? undefined,
          height: it.height ?? undefined,
          optionIds: it.optionIds || [],
        })),
      }

      const saved = isEdit ? await updateQuote(id, payload) : await createQuote(payload)

      message.success(isEdit ? 'Orçamento atualizado!' : 'Orçamento criado!')

      setPreview({
        subtotalCents: saved.subtotalCents || 0,
        totalCents: saved.totalCents || 0,
      })

      if (!isEdit && saved?.id) {
        navigate(`/quotes/${saved.id}/edit`, { replace: true })
      }
    } catch (err) {
      if (err?.errorFields) return
      message.error('Erro ao salvar orçamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
      {/* Header */}
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={14}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/quotes')}>
              Voltar
            </Button>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {isEdit ? 'Editar Orçamento' : 'Novo Orçamento'}
              </Title>
              <Text type="secondary">Monte itens e aplique descontos.</Text>
            </div>
          </Space>
        </Col>

        <Col xs={24} md={10} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>
            Salvar
          </Button>
        </Col>
      </Row>

      <Form form={form} layout="vertical" requiredMark={false}>
        <Row gutter={[12, 12]}>
          {/* ===== COLUNA PRINCIPAL ===== */}
          <Col xs={24} lg={16}>
            <Card>
              <Row gutter={[12, 12]}>
                <Col xs={24} md={14}>
                  <Form.Item name="customerUserId" label="Cliente" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      filterOption={false}
                      onSearch={loadCustomers}
                      loading={customersLoading}
                      options={customerOptions}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={10}>
                  <Form.Item name="notes" label="Observações">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* ===== ITENS ===== */}
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <Space style={{ justifyContent: 'space-between' }}>
                      <Text strong>Itens</Text>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => add({ quantity: 1 })}
                      >
                        Adicionar item
                      </Button>
                    </Space>

                    {fields.map((field) => (
                      <div
                        key={field.key}
                        style={{
                          border: '1px solid #E6ECE9',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <Row gutter={[12, 12]}>
                          {/* productId hidden */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'productId']}
                            hidden
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>

                          {/* productLabel visível */}
                          <Col xs={24} md={10}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'productLabel']}
                              label="Produto"
                              rules={[
                                {
                                  required: true,
                                  message: 'Selecione um produto',
                                },
                              ]}
                            >
                              <Input
                                readOnly
                                placeholder="Selecione um produto..."
                                addonAfter={
                                  <Button
                                    onClick={() => openPickerForItem(field.name)}
                                    type="primary"
                                  >
                                    Buscar
                                  </Button>
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={12} md={4}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              label="Qtd"
                              rules={[{ required: true }]}
                            >
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>

                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'width']} label="Largura">
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>

                          <Col xs={12} md={5}>
                            <Form.Item {...field} name={[field.name, 'height']} label="Altura">
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={6}>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                            >
                              Remover
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                )}
              </Form.List>
            </Card>
          </Col>

          {/* ===== SIDEBAR RESUMO ===== */}
          <Col xs={24} lg={8}>
            <Affix offsetTop={84}>
              <Card>
                <Title level={5}>Resumo</Title>

                <Form.Item name="discount" label="Desconto">
                  <Input placeholder="0,00" />
                </Form.Item>

                <Form.Item name="shipping" label="Frete">
                  <Input placeholder="0,00" />
                </Form.Item>

                <Form.Item name="tax" label="Imposto">
                  <Input placeholder="0,00" />
                </Form.Item>

                <Divider />

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space
                    style={{
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Text>Subtotal</Text>
                    <Text strong>{formatCentsBRL(preview.subtotalCents)}</Text>
                  </Space>

                  <Space
                    style={{
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Text>Total</Text>
                    <Text strong style={{ fontSize: 18 }}>
                      {formatCentsBRL(preview.totalCents)}
                    </Text>
                  </Space>

                  <Button type="primary" block loading={loading} onClick={onSave}>
                    Salvar
                  </Button>
                </Space>
              </Card>
            </Affix>
          </Col>
        </Row>
      </Form>

      {/* ===== PRODUCT PICKER ===== */}
      <ProductPickerModal
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false)
          setPickerTargetIndex(null)
        }}
        onPick={handlePickProduct}
      />
    </div>
  )
}
