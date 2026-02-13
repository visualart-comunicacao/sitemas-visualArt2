import React, { useState } from 'react'
import { Button, Input, Space, Switch, Typography } from 'antd'
import { SendOutlined, PaperClipOutlined, AudioOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [internalNote, setInternalNote] = useState(false)

  function submit() {
    const v = text.trim()
    if (!v) return
    onSend(internalNote ? `[NOTA INTERNA] ${v}` : v)
    setText('')
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <PaperClipOutlined />
          <Text type="secondary">Anexar Arquivo</Text>
        </Space>

        <Space>
          <Switch checked={internalNote} onChange={setInternalNote} size="small" />
          <Text type="secondary">Nota Interna</Text>
        </Space>
      </Space>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={disabled}
        />
        <Button icon={<AudioOutlined />} />
        <Button type="primary" icon={<SendOutlined />} onClick={submit} disabled={disabled}>
          Enviar
        </Button>
      </Space.Compact>
    </Space>
  )
}
