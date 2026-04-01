import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const turnosAPI = {
  getHoy:      ()       => api.get('/turnos/hoy'),
  getTodos:    ()       => api.get('/turnos'),
  getDia:      (fecha)  => api.get(`/turnos/dia?fecha=${fecha}`),
  getOcupados: (fecha)  => api.get(`/turnos/ocupados?fecha=${fecha}`),
  buscar:      (q)      => api.get(`/turnos/buscar?q=${encodeURIComponent(q)}`),
  crear:       (turno)  => api.post('/turnos', turno),
  confirmar:   (id)     => api.put(`/turnos/${id}/confirmar`),
  cancelar:    (id)     => api.put(`/turnos/${id}/cancelar`),
  completar:   (id)     => api.put(`/turnos/${id}/completar`),
}

export const configAPI = {
  get:   ()       => api.get('/config'),
  save:  (data)   => api.post('/config', data),
}

export default api
