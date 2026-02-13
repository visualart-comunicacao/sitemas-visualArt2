import React from 'react'

export default function MessageBubble({ message }) {
  const mine = message.author === 'me'
  return (
    <div style={{ marginBottom: 12 }}>
      <div className={`vc-bubble ${mine ? 'me' : ''}`}>
        {message.text}
        <div className="vc-meta">{message.at}</div>
      </div>
    </div>
  )
}
