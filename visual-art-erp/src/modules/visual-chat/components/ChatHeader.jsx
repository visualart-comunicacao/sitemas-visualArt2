import React from 'react'
import { Avatar, Button, Space, Tag, Typography, Tooltip } from 'antd'
import { UserOutlined, ShareAltOutlined, MoreOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function ChatHeader({ contact, onToggleRight }) {
  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Avatar icon={<UserOutlined />} />
        <div style={{ lineHeight: 1.1 }}>
          <Text strong>{contact?.name || 'Selecione uma conversa'}</Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {(contact?.tags || []).map((t) => (
              <Tag key={t} color="green">
                {t}
              </Tag>
            ))}
          </div>
        </div>
      </Space>

      <Space>
        <Button icon={<ShareAltOutlined />} />
        <Tooltip title="Recolher/mostrar painel">
          <Button icon={<MoreOutlined />} onClick={onToggleRight} />
        </Tooltip>
      </Space>
    </Space>
  )
}
