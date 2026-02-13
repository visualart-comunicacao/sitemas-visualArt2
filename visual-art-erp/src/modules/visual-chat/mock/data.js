export const mockUser = {
  id: 'u1',
  name: 'Alex Borelli',
  status: 'Disponível',
  avatarUrl: null,
}

export const mockContacts = [
  {
    id: 'c1',
    name: 'URIAS MARCOS - GRUPO STEEL',
    phone: '+55 (16) 99778-5661',
    tags: ['Padrão', 'ATENDIMENTO ALEX'],
    avatarUrl: null,
  },
]

export const mockThreads = [
  {
    id: 't1',
    contactId: 'c1',
    title: 'URIAS MARCOS - GRUPO STEEL',
    lastMessage: 'URIAS MARCOS - GRUPO STEEL: ...',
    updatedAt: '12:29',
    unread: 1,
    queue: 'Meus',
  },
]

export const mockMessagesByThread = {
  t1: [
    {
      id: 'm1',
      threadId: 't1',
      author: 'me',
      text: 'Perfeito',
      at: '13/02/2026 12:00',
    },
    {
      id: 'm2',
      threadId: 't1',
      author: 'me',
      text: 'Ok',
      at: '13/02/2026 12:29',
    },
    {
      id: 'm3',
      threadId: 't1',
      author: 'me',
      text: 'Agradeço a atenção, vou passar para o Guilherme e damos prosseguimento',
      at: '13/02/2026 12:17',
    },
  ],
}
