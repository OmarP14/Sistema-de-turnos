import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Agrega el token JWT a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('barbershop_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Si recibe 401, elimina el token y redirige al login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('barbershop_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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

export const barberiaAPI = {
  get:  ()     => api.get('/config/barberia'),
  save: (data) => api.put('/config/barberia', data),
}

export const disponibilidadAPI = {
  get:              ()      => api.get('/config/disponibilidad'),
  updateDias:       (dias)  => api.put('/config/dias-laborales', { dias }),
  bloquear:         (fecha) => api.post(`/config/bloquear/${fecha}`),
  desbloquear:      (fecha) => api.delete(`/config/bloquear/${fecha}`),
  importarFeriados: ()      => api.post('/config/importar-feriados'),
}

export const serviciosAPI = {
  get:  ()          => api.get('/config/servicios'),
  save: (servicios) => api.put('/config/servicios', { servicios }),
}

export default api
