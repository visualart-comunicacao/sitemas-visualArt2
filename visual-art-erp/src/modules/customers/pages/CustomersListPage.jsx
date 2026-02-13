import React, { useEffect, useMemo, useState } from 'react'
import { Button, Input, Select, Space, Table, Tag, Typography, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'
import { listCustomers } from '@/api/customers.api'
import CustomerModal from '../components/CustomerModal'

const { Title, Text } = Typography

export default function CustomersListPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])

  // filtros (envia pra API se existir suporte; senão, já fica pronto)
  const [q, setQ] = useState('')
  const [type, setType] = useState(null) // PERSON|BUSINESS
  const [isBlocked, setIsBlocked] = useState(null) // true/false
  const [isActive, setIsActive] = useState(null) // true/false
  const [isErpOnly, setIsErpOnly] = useState(null) // true/false

  // modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedId, setSelectedId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const params = {
        search: q || undefined, // ✅ backend espera "search"
        type: type || undefined,
        isBlocked: isBlocked ?? undefined,
        isActive: isActive ?? undefined,
        isErpOnly: isErpOnly ?? undefined, // (se seu backend nem usa, pode remover)
      }
      const res = await listCustomers(params)
      console.log('meta', res?.meta)
      console.log('rows', res?.data)
      console.log('rows length', res?.data?.length)
      setRows(res?.data || [])
    } catch (err) {
      message.error(err?.response?.data?.message || 'Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo(
    () => [
      { title: 'Nome', dataIndex: 'name', key: 'name' },
      {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email',
        render: (v) => v || <Text type="secondary">—</Text>,
      },
      {
        title: 'Telefone',
        dataIndex: 'phone',
        key: 'phone',
        render: (v) => v || <Text type="secondary">—</Text>,
      },
      {
        title: 'Status',
        key: 'status',
        render: (_, row) => {
          const active = row.isActive ?? true
          return active ? <Tag color="green">Ativo</Tag> : <Tag>Inativo</Tag>
        },
      },
      {
        title: 'Ações',
        key: 'actions',
        render: (_, row) => (
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedId(row.id)
              setModalMode('edit')
              setModalOpen(true)
            }}
          >
            Editar
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Space style={{ justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Clientes
          </Title>
          <Text type="secondary">Cadastro completo (User + Profile + Address).</Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedId(null)
            setModalMode('create')
            setModalOpen(true)
          }}
        >
          Novo cliente
        </Button>
      </Space>

      <Space wrap>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome/email/telefone..."
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          onPressEnter={load}
        />

        <Select
          value={type}
          onChange={setType}
          placeholder="Tipo (PF/PJ)"
          allowClear
          style={{ width: 170 }}
          options={[
            { label: 'Pessoa (PF)', value: 'PERSON' },
            { label: 'Empresa (PJ)', value: 'BUSINESS' },
          ]}
        />

        <Select
          value={isActive}
          onChange={setIsActive}
          placeholder="Ativo"
          allowClear
          style={{ width: 140 }}
          options={[
            { label: 'Ativo', value: true },
            { label: 'Inativo', value: false },
          ]}
        />

        <Select
          value={isErpOnly}
          onChange={setIsErpOnly}
          placeholder="Somente ERP"
          allowClear
          style={{ width: 160 }}
          options={[
            { label: 'Sim', value: true },
            { label: 'Não', value: false },
          ]}
        />

        <Select
          value={isBlocked}
          onChange={setIsBlocked}
          placeholder="Bloqueado"
          allowClear
          style={{ width: 150 }}
          options={[
            { label: 'Sim', value: true },
            { label: 'Não', value: false },
          ]}
        />

        <Button onClick={load}>Filtrar</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <CustomerModal
        open={modalOpen}
        mode={modalMode}
        customerId={selectedId}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
      />
    </div>
  )
}
