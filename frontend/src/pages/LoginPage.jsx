import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import axios from 'axios'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('barbershop_token', res.data.token)
      navigate('/', { replace: true })
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080f1e 0%, #0d1a2e 50%, #080f1e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Línea superior degradada */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg,#E8192C 0%,#3b82f6 50%,#0d2347 100%)',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 0 40px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg,#E8192C,#b91c2c)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(232,25,44,0.5)',
          }}>
            <Scissors size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue',cursive", fontSize: '1.7rem',
              letterSpacing: '0.1em', lineHeight: 1,
              background: 'linear-gradient(90deg,#F8F8F8,#93c5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              BARBER<span style={{ WebkitTextFillColor: '#E8192C' }}>APP</span>
            </div>
            <div style={{
              fontFamily: "'Barlow',sans-serif", fontSize: '0.58rem',
              color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              Panel del Barbero
            </div>
          </div>
        </div>

        <h2 style={{
          fontFamily: "'Oswald',sans-serif", fontSize: '1rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: '#94a3b8', marginBottom: '1.5rem',
        }}>
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b',
              fontFamily: "'Barlow',sans-serif", letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '6px' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '8px', color: '#e2e8f0',
                fontFamily: "'Barlow',sans-serif", fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b',
              fontFamily: "'Barlow',sans-serif", letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '8px', color: '#e2e8f0',
                fontFamily: "'Barlow',sans-serif", fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(232,25,44,0.12)',
              border: '1px solid rgba(232,25,44,0.3)',
              borderRadius: '8px',
              color: '#fb7185',
              fontFamily: "'Barlow',sans-serif", fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '11px',
              background: loading
                ? 'rgba(232,25,44,0.4)'
                : 'linear-gradient(135deg,#E8192C,#b91c2c)',
              border: 'none', borderRadius: '8px',
              color: '#fff',
              fontFamily: "'Oswald',sans-serif", fontSize: '0.9rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(232,25,44,0.4)',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
