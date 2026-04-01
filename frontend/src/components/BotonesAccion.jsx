import { CheckCircle, XCircle, MessageCircle, Star } from 'lucide-react'
import { turnosAPI } from '../utils/api'

const btn = (bg, color, border) => ({
  background: bg, color,
  border: `1px solid ${border}`,
  padding: '7px 14px', borderRadius: '4px',
  fontSize: '0.78rem', fontFamily: "'Oswald', sans-serif",
  fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '6px', transition: 'all 0.2s', whiteSpace: 'nowrap', textDecoration: 'none',
})

export default function BotonesAccion({ turno, onAccion }) {
  return (
    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'4px' }}>

      {turno.estado === 'PENDIENTE' && (
        <button onClick={() => onAccion(turnosAPI.confirmar, turno.id, `${turno.clienteNombre} confirmado ✅`)}
          style={btn('rgba(59,130,246,0.12)','#93c5fd','rgba(59,130,246,0.35)')}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.22)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,0.12)'}>
          <CheckCircle size={14}/> Confirmar
        </button>
      )}

      {turno.estado === 'CONFIRMADO' && (
        <button onClick={() => onAccion(turnosAPI.completar, turno.id, 'Turno completado ✅')}
          style={btn('rgba(34,197,94,0.12)','#86efac','rgba(34,197,94,0.35)')}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.22)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(34,197,94,0.12)'}>
          <Star size={14}/> Completar
        </button>
      )}

      {(turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO') && (
        <button onClick={() => onAccion(turnosAPI.cancelar, turno.id, `Turno de ${turno.clienteNombre} cancelado`)}
          style={btn('rgba(232,25,44,0.10)','#fb7185','rgba(232,25,44,0.3)')}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(232,25,44,0.20)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(232,25,44,0.10)'}>
          <XCircle size={14}/> Cancelar
        </button>
      )}

      <a href={`https://wa.me/${turno.clienteTelefono}`} target="_blank" rel="noreferrer"
        style={btn('rgba(37,211,102,0.10)','#4ade80','rgba(37,211,102,0.3)')}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(37,211,102,0.20)'}
        onMouseLeave={e=>e.currentTarget.style.background='rgba(37,211,102,0.10)'}>
        <MessageCircle size={14}/> WhatsApp
      </a>

    </div>
  )
}
