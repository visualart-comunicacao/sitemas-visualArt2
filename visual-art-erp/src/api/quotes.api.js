import { http } from '@/api/http'

export async function listQuotes(params = {}) {
  const { data } = await http.get('/admin/quotes', { params })
  return data // { data, meta } (ideal) ou array
}

export async function createQuote(payload) {
  const { data } = await http.post('/quotes', payload)
  return data
}

export async function getQuote(id) {
  const { data } = await http.get(`/quotes/${id}`)
  return data
}

export async function updateQuote(id, payload) {
  const { data } = await http.patch(`/quotes/${id}`, payload)
  return data
}

export async function cancelQuote(id, payload = {}) {
  const { data } = await http.patch(`/quotes/${id}/cancel`, payload)
  return data
}

export async function convertQuote(id, payload = {}) {
  const { data } = await http.post(`/quotes/${id}/convert`, payload)
  return data
}
