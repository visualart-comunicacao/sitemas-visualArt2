import React, { useMemo, useState } from 'react'
import { FloatButton, Form, Input, message, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ChatShell from '../components/ChatShell'
import {
  mockContacts,
  mockMessagesByThread,
  mockThreads,
  mockUser,
  PRESENCE_OPTIONS,
  mockAgents,
} from '../mock/data'

export default function VisualChatPage() {
  const [user, setUser] = useState(mockUser)

  const [contacts, setContacts] = useState(mockContacts)
  const [threads, setThreads] = useState(mockThreads)
  const [messagesByThread, setMessagesByThread] = useState(mockMessagesByThread)

  const [activeThreadId, setActiveThreadId] = useState(mockThreads[0]?.id || null)

  // Nova conversa (mock)
  const [newOpen, setNewOpen] = useState(false)
  const [newForm] = Form.useForm()

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId],
  )

  const activeContact = useMemo(() => {
    if (!activeThread) return null
    return contacts.find((c) => c.id === activeThread.contactId) || null
  }, [activeThread, contacts])

  const activeMessages = useMemo(() => {
    if (!activeThreadId) return []
    return messagesByThread[activeThreadId] || []
  }, [messagesByThread, activeThreadId])

  function onChangePresence(nextPresence) {
    setUser((prev) => ({ ...prev, presence: nextPresence }))
  }

  function sendMessage(text, meta = {}) {
    if (!activeThreadId) return
    const now = new Date()
    const newMsg = {
      id: `m_${Date.now()}`,
      threadId: activeThreadId,
      author: 'me',
      type: meta.type || 'text',
      text: meta.type === 'text' ? text : undefined,
      url: meta.type === 'image' ? meta.url : undefined,
      caption: meta.type === 'image' ? meta.caption || null : undefined,
      audioDuration: meta.type === 'audio' ? meta.audioDuration || '0:09' : undefined,
      at: now.toLocaleString('pt-BR'),
    }

    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }))

    // atualiza preview da thread
    const preview =
      newMsg.type === 'text'
        ? text
        : newMsg.type === 'image'
          ? '📷 Foto'
          : newMsg.type === 'audio'
            ? '🎤 Áudio'
            : 'Mensagem'

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: preview,
              updatedAt: now.toLocaleTimeString('pt-BR').slice(0, 5),
            }
          : t,
      ),
    )
  }

  // mock anexo de imagem (sem API)
  function sendMockImage() {
    if (!activeThreadId) return
    // usa uma imagem demo
    const url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900'
    sendMessage('', { type: 'image', url, caption: null })
  }

  function changeTicket(nextTicket) {
    if (!activeThreadId) return
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, ticketCurrent: nextTicket } : t)),
    )
    message.success(`Ticket alterado para ${nextTicket} (mock)`)
  }

  function transferThread(agentName) {
    if (!activeThreadId) return
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, assignedTo: agentName } : t)),
    )
    message.success(`Conversa transferida para ${agentName} (mock)`)
  }

  function shareThread(action) {
    if (!activeThreadId) return
    if (action === 'copy') {
      navigator.clipboard
        .writeText(`visualchat://thread/${activeThreadId}`)
        .then(() => message.success('Copiado!'))
        .catch(() => message.error('Não foi possível copiar.'))
      return
    }
    if (action === 'export') {
      message.info('Export mock (sem backend)')
    }
  }

  async function onCreateConversation() {
    const v = await newForm.validateFields()
    const contactId = `c_${Date.now()}`
    const threadId = `t_${Date.now()}`

    const newContact = {
      id: contactId,
      name: v.name,
      phone: v.phone,
      tags: [],
      avatarUrl: null,
      notes: null,
    }

    const newThread = {
      id: threadId,
      contactId,
      title: v.name,
      lastMessage: '',
      updatedAt: new Date().toLocaleTimeString('pt-BR').slice(0, 5),
      unread: 0,
      queue: 'MEUS',
      ticketCurrent: '#—',
      ticketList: ['#—'],
      assignedTo: user?.name || 'Alex',
    }

    setContacts((prev) => [newContact, ...prev])
    setThreads((prev) => [newThread, ...prev])
    setMessagesByThread((prev) => ({ ...prev, [threadId]: [] }))
    setActiveThreadId(threadId)

    setNewOpen(false)
    newForm.resetFields()
    message.success('Conversa criada (mock)')
  }

  return (
    <>
      <ChatShell
        user={user}
        presenceOptions={PRESENCE_OPTIONS}
        onChangePresence={onChangePresence}
        agents={mockAgents}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        contact={activeContact}
        thread={activeThread}
        messages={activeMessages}
        onSendMessage={(text) => sendMessage(text, { type: 'text' })}
        onSendMockImage={sendMockImage}
        onChangeTicket={changeTicket}
        onTransfer={transferThread}
        onShare={shareThread}
      />

      {/* Nova conversa */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="Nova conversa"
        onClick={() => setNewOpen(true)}
      />

      <Modal
        open={newOpen}
        onCancel={() => setNewOpen(false)}
        onOk={onCreateConversation}
        okText="Criar"
        title="Nova conversa"
      >
        <Form form={newForm} layout="vertical">
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefone"
            rules={[{ required: true, message: 'Informe o telefone' }]}
          >
            <Input placeholder="+55 (16) 9...." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
