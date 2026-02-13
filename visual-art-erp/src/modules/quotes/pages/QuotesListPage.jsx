import { useEffect, useMemo, useState } from 'react'
import {
  Row,
  Col,
  Space,
  Typography,
  Button,
  Input,
  Select,
  Table,
  Tag,
  message,
  Modal,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { listQuotes, cancelQuote, convertQuote } from '../../../api/quotes.api'
import { formatCentsBRL } from '../../../shared/utils/money'

const { Title, Text } = Typography

export default function QuotesListPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])

  // filtros
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(null)

  // paginação
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [total, setTotal] = useState(0)

  async function load(next = {}) {
    try {
      setLoading(true)
      const p = next.page ?? page
      const ps = next.pageSize ?? pageSize

      const params = {
        page: p,
        pageSize: ps,
        search: search || undefined,
        status: status || undefined,
      }

      const res = await listQuotes(params)

      const data = res?.data ?? res?.items ?? res
      setRows(Array.isArray(data) ? data : [])
      setTotal(res?.meta?.total ?? res?.meta?.totalItems ?? (Array.isArray(data) ? data.length : 0))

      setPage(res?.meta?.page ?? p)
      setPageSize(res?.meta?.pageSize ?? ps)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Erro ao carregar orçamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function confirmCancel(row) {
    Modal.confirm({
      title: 'Cancelar orçamento?',
      content: `${row.code} será cancelado.`,
      okText: 'Cancelar orçamento',
      okButtonProps: { danger: true },
      cancelText: 'Voltar',
      async onOk() {
        try {
          await cancelQuote(row.id, { internalNotes: 'Cancelado via ERP' })
          message.success('Orçamento cancelado!')
          load()
        } catch (err) {
          message.error(err?.response?.data?.message || 'Erro ao cancelar orçamento.')
        }
      },
    })
  }

  function confirmConvert(row) {
    Modal.confirm({
      title: 'Converter orçamento em venda?',
      content: `Isso criará um PED a partir de ${row.code}.`,
      okText: 'Converter',
      cancelText: 'Voltar',
      async onOk() {
        try {
          await convertQuote(row.id, { saleStatus: 'PENDING' })
          message.success('Convertido em venda!')
          load()
        } catch (err) {
          message.error(err?.response?.data?.message || 'Erro ao converter.')
        }
      },
    })
  }

  const columns = useMemo(
    () => [
      {
        title: 'Código',
        dataIndex: 'code',
        key: 'code',
        width: 160,
        ellipsis: true,
      },
      {
        title: 'Cliente',
        key: 'customer',
        width: 240,
        ellipsis: true,
        render: (_, row) => (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {row?.user?.name || row?.customerName || '—'}
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {row?.user?.phone || row?.customerPhone || ''}
            </div>
          </div>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (v) => {
          if (v === 'CANCELED') return <Tag color="red">Cancelado</Tag>
          return <Tag color="green">Pendente</Tag>
        },
      },
      {
        title: 'Total',
        dataIndex: 'totalCents',
        key: 'totalCents',
        width: 140,
        render: (v) => formatCentsBRL(v),
      },
      {
        title: 'Criado em',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        responsive: ['md'],
        render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
      },
      {
        title: 'Ações',
        key: 'actions',
        width: 150,
        fixed: 'right',
        render: (_, row) => (
          <Space size={8}>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => confirmConvert(row)}
              disabled={row.status === 'CANCELED'}
            />
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => confirmCancel(row)}
              disabled={row.status === 'CANCELED'}
            />
          </Space>
        ),
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
      {/* Header responsivo */}
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={14}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Orçamentos
            </Title>
            <Text type="secondary">Criar, listar, cancelar e converter em pedido.</Text>
          </div>
        </Col>

        <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => load()}>
              Recarregar
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/quotes/new')}>
              Novo orçamento
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filtros responsivos */}
      <Row gutter={[12, 12]} align="middle" style={{ width: '100%', minWidth: 0 }}>
        <Col xs={24} md={10} lg={8}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código ORC..."
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: '100%' }}
            onPressEnter={() => {
              setPage(1)
              load({ page: 1 })
            }}
          />
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            placeholder="Status"
            allowClear
            style={{ width: '100%' }}
            options={[
              { label: 'Pendente', value: 'PENDING' },
              { label: 'Cancelado', value: 'CANCELED' },
            ]}
          />
        </Col>

        <Col xs={12} md={4} lg={4}>
          <Button
            block
            onClick={() => {
              setPage(1)
              load({ page: 1 })
            }}
          >
            Filtrar
          </Button>
        </Col>
      </Row>

      {/* Table responsiva */}
      <div style={{ minWidth: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
          }}
          onChange={(pagination) => {
            const nextPage = pagination.current || 1
            const nextSize = pagination.pageSize || pageSize
            setPage(nextPage)
            setPageSize(nextSize)
            load({ page: nextPage, pageSize: nextSize })
          }}
        />
      </div>
    </div>
  )
}
