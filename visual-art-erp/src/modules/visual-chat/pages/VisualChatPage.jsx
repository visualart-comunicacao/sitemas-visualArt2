import React, { useMemo, useState } from 'react'
import ChatShell from '../components/ChatShell'
import { mockContacts, mockMessagesByThread, mockThreads, mockUser } from '../mock/data'

export default function VisualChatPage() {
  const [activeThreadId, setActiveThreadId] = useState(mockThreads[0]?.id || null)
  const [threads, setThreads] = useState(mockThreads)
  const [messagesByThread, setMessagesByThread] = useState(mockMessagesByThread)

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId],
  )

  const activeContact = useMemo(() => {
    if (!activeThread) return null
    return mockContacts.find((c) => c.id === activeThread.contactId) || null
  }, [activeThread])

  const activeMessages = useMemo(() => {
    if (!activeThreadId) return []
    return messagesByThread[activeThreadId] || []
  }, [messagesByThread, activeThreadId])

  function sendMessage(text) {
    if (!activeThreadId) return
    const newMsg = {
      id: `m_${Date.now()}`,
      threadId: activeThreadId,
      author: 'me',
      text,
      at: new Date().toLocaleString('pt-BR'),
    }

    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }))

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: text,
              updatedAt: new Date().toLocaleTimeString('pt-BR').slice(0, 5),
            }
          : t,
      ),
    )
  }

  return (
    <ChatShell
      user={mockUser}
      threads={threads}
      activeThreadId={activeThreadId}
      onSelectThread={setActiveThreadId}
      contact={activeContact}
      messages={activeMessages}
      onSendMessage={sendMessage}
    />
  )
}
