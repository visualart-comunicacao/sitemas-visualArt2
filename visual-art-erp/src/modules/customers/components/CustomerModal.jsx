import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Segmented,
  Space,
  Switch,
  Tabs,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { createCustomer, getCustomer, updateCustomer } from '@/api/customers.api'
import { normalizeCustomerResponse } from '../customers.mapper'

const { Text } = Typography

const CUSTOMER_TYPES = [
  { label: 'Pessoa (PF)', value: 'PERSON' },
  { label: 'Empresa (PJ)', value: 'BUSINESS' },
]

const GENDER_OPTIONS = [
  { label: 'Não informar', value: 'NOT_INFORMED' },
  { label: 'Masculino', value: 'MALE' },
  { label: 'Feminino', value: 'FEMALE' },
  { label: 'Outro', value: 'OTHER' },
]

// formatadores leves (sem lib)
function onlyDigits(v = '') {
  return String(v).replace(/\D/g, '')
}
function maskCep(v = '') {
  const d = onlyDigits(v).slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}
function maskCpf(v = '') {
  const d = onlyDigits(v).slice(0, 11)
  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 9)
  const p4 = d.slice(9, 11)
  if (d.length <= 3) return p1
  if (d.length <= 6) return `${p1}.${p2}`
  if (d.length <= 9) return `${p1}.${p2}.${p3}`
  return `${p1}.${p2}.${p3}-${p4}`
}
function maskCnpj(v = '') {
  const d = onlyDigits(v).slice(0, 14)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 8)
  const p4 = d.slice(8, 12)
  const p5 = d.slice(12, 14)
  if (d.length <= 2) return p1
  if (d.length <= 5) return `${p1}.${p2}`
  if (d.length <= 8) return `${p1}.${p2}.${p3}`
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

export default function CustomerModal({ open, mode, customerId, onClose, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = mode === 'edit'

  const title = useMemo(() => (isEdit ? 'Editar cliente' : 'Novo cliente'), [isEdit])

  useEffect(() => {
    if (!open) return

    async function load() {
      try {
        setLoading(true)

        if (isEdit && customerId) {
          const raw = await getCustomer(customerId)
          const { user, profile, addresses } = normalizeCustomerResponse(raw)
          const addr = (addresses || []).find((a) => a.isDefault) || addresses?.[0] || null

          form.setFieldsValue({
            // USER
            name: user?.name || '',
            email: user?.email || null,
            phone: user?.phone || null,
            document: user?.document || null,
            isActive: user?.isActive ?? true,
            isErpOnly: user?.isErpOnly ?? false,

            // PROFILE
            profileType: profile?.type || 'PERSON',
            fullName: profile?.fullName || null,
            birthDate: profile?.birthDate ? dayjs(profile.birthDate) : null,
            gender: profile?.gender || 'NOT_INFORMED',
            cpf: profile?.cpf || null,
            rg: profile?.rg || null,

            companyName: profile?.companyName || null,
            tradeName: profile?.tradeName || null,
            cnpj: profile?.cnpj || null,
            stateTaxId: profile?.stateTaxId || null,
            municipalTaxId: profile?.municipalTaxId || null,

            phone2: profile?.phone2 || null,
            whatsapp: profile?.whatsapp ?? true,

            marketingOptIn: profile?.marketingOptIn ?? false,
            termsAcceptedAt: profile?.termsAcceptedAt
              ? dayjs(profile.termsAcceptedAt).format('DD/MM/YYYY HH:mm')
              : null,

            notes: profile?.notes || null,
            isBlocked: profile?.isBlocked ?? false,

            // ADDRESS (1 principal)
            addressType: addr?.type || 'SHIPPING',
            addressLabel: addr?.label || null,
            addressRecipient: addr?.recipient || null,
            addressZipCode: addr?.zipCode || null,
            addressStreet: addr?.street || null,
            addressNumber: addr?.number || null,
            addressComplement: addr?.complement || null,
            addressDistrict: addr?.district || null,
            addressCity: addr?.city || null,
            addressState: addr?.state || null,
            addressReference: addr?.reference || null,
          })
        } else {
          form.resetFields()
          form.setFieldsValue({
            isActive: true,
            isErpOnly: false,
            profileType: 'PERSON',
            gender: 'NOT_INFORMED',
            whatsapp: true,
            marketingOptIn: false,
            isBlocked: false,
            addressType: 'SHIPPING',
          })
        }
      } catch (err) {
        message.error(err?.response?.data?.message || 'Erro ao carregar cliente.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [open, isEdit, customerId, form])

  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Payload alinhado ao schema (User + CustomerProfile + Address default)
      const payload = {
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        document: values.document || null,
        isActive: values.isActive ?? true,

        type: values.profileType, // PERSON | BUSINESS

        // PF
        fullName: values.fullName || null,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
        gender: values.gender || 'NOT_INFORMED',
        cpf: values.cpf ? onlyDigits(values.cpf) : null,
        rg: values.rg || null,

        // PJ
        cnpj: values.cnpj ? onlyDigits(values.cnpj) : null,
        companyName: values.companyName || null,
        tradeName: values.tradeName || null,
        stateTaxId: values.stateTaxId || null,
        municipalTaxId: values.municipalTaxId || null,

        // contato / lgpd / controle
        phone2: values.phone2 || null,
        whatsapp: !!values.whatsapp,
        marketingOptIn: !!values.marketingOptIn,
        notes: values.notes || null,
        isBlocked: !!values.isBlocked,

        // endereço (envia só se tiver CEP)
        address: values.addressZipCode
          ? {
              type: values.addressType || 'SHIPPING',
              isDefault: true,
              label: values.addressLabel || null,
              recipient: values.addressRecipient || null,
              zipCode: onlyDigits(values.addressZipCode),
              street: values.addressStreet,
              number: values.addressNumber,
              complement: values.addressComplement || null,
              district: values.addressDistrict,
              city: values.addressCity,
              state: values.addressState,
              reference: values.addressReference || null,
            }
          : null,
      }

      if (isEdit) {
        await updateCustomer(customerId, payload)
        message.success('Cliente atualizado!')
      } else {
        console.log(payload)
        await createCustomer(payload)
        message.success('Cliente criado!')
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      if (err?.errorFields) return // validação do Form
      message.error(err?.response?.data?.message || 'Erro ao salvar cliente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      width={980}
      destroyOnHidden
      mask={{
        closable: false,
      }}
      footer={
        <Space>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Salvar
          </Button>
        </Space>
      }
      styles={{
        body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8 },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Tabs
          defaultActiveKey="user"
          items={[
            {
              key: 'user',
              label: 'Dados',
              children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Form.Item
                    name="name"
                    label="Nome"
                    rules={[{ required: true, message: 'Informe o nome' }]}
                  >
                    <Input placeholder="Nome do cliente" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="E-mail (opcional)"
                    rules={[{ type: 'email', message: 'E-mail inválido' }]}
                  >
                    <Input placeholder="email@dominio.com" />
                  </Form.Item>

                  <Form.Item name="phone" label="Telefone (opcional)">
                    <Input placeholder="(00) 00000-0000" />
                  </Form.Item>

                  <Form.Item name="document" label="Documento (opcional)">
                    <Input placeholder="Uso interno (evite duplicar CPF/CNPJ)" />
                  </Form.Item>

                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    <Form.Item name="isActive" label="Ativo" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="isErpOnly" label="Somente ERP" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>

                  <Text type="secondary" style={{ gridColumn: '1 / -1' }}>
                    “Somente ERP” = cliente sem login do e-commerce (password pode ficar null no
                    backend).
                  </Text>
                </div>
              ),
            },
            {
              key: 'profile',
              label: 'Perfil',
              children: (
                <div style={{ display: 'grid', gap: 12 }}>
                  <Form.Item name="profileType" label="Tipo">
                    <Segmented options={CUSTOMER_TYPES} />
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate={(p, c) => p.profileType !== c.profileType}>
                    {({ getFieldValue }) => {
                      const type = getFieldValue('profileType')

                      if (type === 'BUSINESS') {
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Form.Item
                              name="companyName"
                              label="Razão social"
                              rules={[{ required: true, message: 'Informe a razão social' }]}
                            >
                              <Input />
                            </Form.Item>

                            <Form.Item name="tradeName" label="Nome fantasia">
                              <Input />
                            </Form.Item>

                            <Form.Item
                              name="cnpj"
                              label="CNPJ"
                              rules={[
                                { required: true, message: 'Informe o CNPJ' },
                                {
                                  validator: (_, v) => {
                                    const d = onlyDigits(v || '')
                                    if (!d) return Promise.resolve()
                                    return d.length === 14
                                      ? Promise.resolve()
                                      : Promise.reject(new Error('CNPJ inválido'))
                                  },
                                },
                              ]}
                            >
                              <Input
                                placeholder="00.000.000/0000-00"
                                onChange={(e) =>
                                  form.setFieldValue('cnpj', maskCnpj(e.target.value))
                                }
                              />
                            </Form.Item>

                            <Form.Item name="stateTaxId" label="Inscrição Estadual (opcional)">
                              <Input />
                            </Form.Item>

                            <Form.Item name="municipalTaxId" label="Inscrição Municipal (opcional)">
                              <Input />
                            </Form.Item>
                          </div>
                        )
                      }

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Form.Item name="fullName" label="Nome completo (opcional)">
                            <Input />
                          </Form.Item>

                          <Form.Item
                            name="cpf"
                            label="CPF (opcional)"
                            rules={[
                              {
                                validator: (_, v) => {
                                  const d = onlyDigits(v || '')
                                  if (!d) return Promise.resolve()
                                  return d.length === 11
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('CPF inválido'))
                                },
                              },
                            ]}
                          >
                            <Input
                              placeholder="000.000.000-00"
                              onChange={(e) => form.setFieldValue('cpf', maskCpf(e.target.value))}
                            />
                          </Form.Item>

                          <Form.Item name="rg" label="RG (opcional)">
                            <Input />
                          </Form.Item>

                          <Form.Item name="birthDate" label="Data de nascimento (opcional)">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                          </Form.Item>

                          <Form.Item name="gender" label="Gênero">
                            <Select options={GENDER_OPTIONS} />
                          </Form.Item>
                        </div>
                      )
                    }}
                  </Form.Item>

                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    <Form.Item name="whatsapp" label="WhatsApp" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="isBlocked" label="Bloqueado" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>

                  <Form.Item name="phone2" label="Telefone 2 (opcional)">
                    <Input />
                  </Form.Item>

                  <Form.Item name="notes" label="Observações (opcional)">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'address',
              label: 'Endereço',
              children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Form.Item name="addressType" label="Tipo de endereço">
                    <Select
                      options={[
                        { label: 'Entrega (SHIPPING)', value: 'SHIPPING' },
                        { label: 'Cobrança (BILLING)', value: 'BILLING' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="addressLabel" label="Etiqueta (opcional)">
                    <Input placeholder="Ex: Casa / Empresa" />
                  </Form.Item>

                  <Form.Item name="addressRecipient" label="Destinatário (opcional)">
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="addressZipCode"
                    label="CEP (opcional)"
                    rules={[
                      {
                        validator: (_, v) => {
                          const d = onlyDigits(v || '')
                          if (!d) return Promise.resolve()
                          return d.length === 8
                            ? Promise.resolve()
                            : Promise.reject(new Error('CEP inválido'))
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="00000-000"
                      onChange={(e) =>
                        form.setFieldValue('addressZipCode', maskCep(e.target.value))
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="addressState"
                    label="UF"
                    rules={[
                      { required: !!form.getFieldValue('addressZipCode'), message: 'Informe UF' },
                    ]}
                  >
                    <Input placeholder="SP" maxLength={2} />
                  </Form.Item>

                  <Form.Item
                    name="addressCity"
                    label="Cidade"
                    rules={[
                      {
                        required: !!form.getFieldValue('addressZipCode'),
                        message: 'Informe cidade',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="addressDistrict"
                    label="Bairro"
                    rules={[
                      {
                        required: !!form.getFieldValue('addressZipCode'),
                        message: 'Informe bairro',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="addressStreet"
                    label="Rua"
                    rules={[
                      { required: !!form.getFieldValue('addressZipCode'), message: 'Informe rua' },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="addressNumber"
                    label="Número"
                    rules={[
                      {
                        required: !!form.getFieldValue('addressZipCode'),
                        message: 'Informe número',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item name="addressComplement" label="Complemento (opcional)">
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="addressReference"
                    label="Referência (opcional)"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <Input />
                  </Form.Item>

                  <Text type="secondary" style={{ gridColumn: '1 / -1' }}>
                    Se você não preencher CEP, o endereço não será enviado no payload.
                  </Text>
                </div>
              ),
            },
            {
              key: 'lgpd',
              label: 'LGPD',
              children: (
                <div style={{ display: 'grid', gap: 12 }}>
                  <Form.Item name="marketingOptIn" label="Marketing Opt-in" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item name="termsAcceptedAt" label="Termos aceitos em (somente leitura)">
                    <Input disabled placeholder="—" />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  )
}
