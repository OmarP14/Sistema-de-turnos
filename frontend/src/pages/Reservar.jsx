import { useState, useEffect } from 'react'
import { turnosAPI } from '../utils/api'
import { format, addDays, startOfToday, isBefore, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle, Loader, Scissors, Clock, User, Phone, Calendar } from 'lucide-react'

// ─── Estilos inline reutilizables ────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#0a1628 0%,#0d2347 45%,#102d5e 100%)',
    fontFamily: "'Barlow',sans-serif",
    color: '#F8F8F8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 0 60px 0',
  },
  header: {
    width: '100%',
    background: 'rgba(8,16,32,0.9)',
    borderBottom: '1px solid rgba(59,130,246,0.2)',
    backdropFilter: 'blur(16px)',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '58px',
    marginBottom: '2rem',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  logoBox: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg,#E8192C,#b91c2c)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 16px rgba(232,25,44,0.5)',
  },
  logoText: {
    fontFamily: "'Bebas Neue',cursive", fontSize: '1.4rem',
    letterSpacing: '0.1em', lineHeight: 1,
  },
  container: {
    width: '100%', maxWidth: '480px', padding: '0 1rem',
  },
  card: {
    background: 'rgba(10,22,40,0.85)',
    border: '1px solid rgba(59,130,246,0.15)',
    borderRadius: '10px',
    padding: '1.5rem',
    backdropFilter: 'blur(12px)',
  },
  stepTitle: {
    fontFamily: "'Bebas Neue',cursive", fontSize: '1.6rem',
    letterSpacing: '0.06em', color: '#F8F8F8', marginBottom: '4px',
  },
  stepSub: {
    fontSize: '0.8rem', color: '#64748b',
    fontFamily: "'Oswald',sans-serif", letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: '1.25rem',
  },
  input: {
    width: '100%', background: 'rgba(5,12,28,0.75)',
    border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px',
    padding: '0.75rem 1rem', color: '#F8F8F8',
    fontFamily: "'Barlow',sans-serif", fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box',
  },
  label: {
    display: 'block', fontFamily: "'Oswald',sans-serif",
    fontSize: '0.7rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#64748b', marginBottom: '8px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg,#E8192C,#b91c2c)',
    color: '#F8F8F8', fontFamily: "'Oswald',sans-serif",
    fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: '8px', fontSize: '0.88rem', width: '100%', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  btnBack: {
    background: 'transparent', color: '#64748b',
    fontFamily: "'Oswald',sans-serif", fontSize: '0.75rem',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    border: '1px solid rgba(59,130,246,0.15)', borderRadius: '6px',
    padding: '8px 16px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
}

// ─── Servicios disponibles ────────────────────────────────────────────────────
const SERVICIOS = [
  { value: 'Corte de pelo', icon: '✂️', desc: 'Corte clásico o moderno' },
  { value: 'Barba',         icon: '🪒', desc: 'Perfilado y afeitado'    },
  { value: 'Corte + Barba', icon: '💈', desc: 'Pack completo'           },
  { value: 'Degradé',       icon: '⚡', desc: 'Degradé con máquina'     },
  { value: 'Coloración',    icon: '🎨', desc: 'Tinte y coloración'      },
]

// ─── Generar horarios 9:00 a 19:00 cada 30 min ────────────────────────────────
const TODOS_HORARIOS = Array.from({ length: 21 }, (_, i) => {
  const t = 9 * 60 + i * 30
  if (t >= 19 * 60) return null
  const h = Math.floor(t / 60).toString().padStart(2, '0')
  const m = (t % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}).filter(Boolean)

// ─── Barra de progreso ────────────────────────────────────────────────────────
function BarraProgreso({ paso }) {
  const pasos = ['Servicio', 'Día', 'Horario', 'Datos']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1.5rem' }}>
      {pasos.map((p, i) => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Oswald',sans-serif",
              background: i < paso ? '#E8192C' : i === paso ? 'rgba(232,25,44,0.2)' : 'rgba(59,130,246,0.08)',
              border: i <= paso ? '2px solid #E8192C' : '2px solid rgba(59,130,246,0.2)',
              color: i <= paso ? '#F8F8F8' : '#475569',
              boxShadow: i === paso ? '0 0 12px rgba(232,25,44,0.4)' : 'none',
            }}>
              {i < paso ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.55rem', fontFamily: "'Oswald',sans-serif",
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: i <= paso ? '#E8192C' : '#475569',
            }}>{p}</span>
          </div>
          {i < pasos.length - 1 && (
            <div style={{
              height: '2px', flex: 1, marginBottom: '16px',
              background: i < paso ? '#E8192C' : 'rgba(59,130,246,0.1)',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── PASO 1: Elegir servicio ──────────────────────────────────────────────────
function PasoServicio({ onNext }) {
  const [seleccionado, setSeleccionado] = useState(null)
  return (
    <div>
      <div style={S.stepTitle}>¿Qué servicio necesitás?</div>
      <div style={S.stepSub}>Elegí una opción para continuar</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
        {SERVICIOS.map(s => (
          <button key={s.value} onClick={() => setSeleccionado(s.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
              border: seleccionado === s.value ? '1px solid #E8192C' : '1px solid rgba(59,130,246,0.15)',
              background: seleccionado === s.value ? 'rgba(232,25,44,0.1)' : 'rgba(5,12,28,0.5)',
              transition: 'all 0.2s', textAlign: 'left', width: '100%',
              boxShadow: seleccionado === s.value ? '0 0 14px rgba(232,25,44,0.2)' : 'none',
            }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ color: '#F8F8F8', fontFamily: "'Oswald',sans-serif", fontWeight: 500, fontSize: '0.95rem' }}>
                {s.value}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.desc}</div>
            </div>
            {seleccionado === s.value && (
              <CheckCircle size={16} style={{ color: '#E8192C', marginLeft: 'auto' }} />
            )}
          </button>
        ))}
      </div>
      <button style={{ ...S.btnPrimary, opacity: seleccionado ? 1 : 0.4 }}
        disabled={!seleccionado}
        onClick={() => seleccionado && onNext(seleccionado)}>
        Continuar →
      </button>
    </div>
  )
}

// ─── PASO 2: Elegir día ───────────────────────────────────────────────────────
function PasoDia({ onNext, onBack }) {
  const hoy = startOfToday()
  const [mes, setMes] = useState(0) // 0 = esta semana, puede expandirse
  const dias = Array.from({ length: 14 }, (_, i) => addDays(hoy, i))
    .filter(d => d.getDay() !== 0) // sin domingos

  return (
    <div>
      <div style={S.stepTitle}>¿Qué día preferís?</div>
      <div style={S.stepSub}>Próximos 14 días disponibles</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '1.25rem' }}>
        {dias.map(dia => {
          const esHoy = isToday(dia)
          return (
            <button key={dia.toISOString()} onClick={() => onNext(dia)}
              style={{
                padding: '12px 8px', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid rgba(59,130,246,0.15)',
                background: esHoy ? 'rgba(232,25,44,0.08)' : 'rgba(5,12,28,0.5)',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}
              onMouseEnter={e => { e.currentTarget.style.border='1px solid rgba(232,25,44,0.4)'; e.currentTarget.style.background='rgba(232,25,44,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.border='1px solid rgba(59,130,246,0.15)'; e.currentTarget.style.background= esHoy ? 'rgba(232,25,44,0.08)' : 'rgba(5,12,28,0.5)' }}>
              <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.62rem',
                letterSpacing:'0.1em', textTransform:'uppercase', color: esHoy ? '#E8192C' : '#64748b' }}>
                {esHoy ? 'HOY' : format(dia, 'EEE', { locale: es }).toUpperCase()}
              </span>
              <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.6rem',
                color: '#F8F8F8', lineHeight: 1 }}>
                {format(dia, 'd')}
              </span>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.7rem', color:'#64748b' }}>
                {format(dia, 'MMM', { locale: es })}
              </span>
            </button>
          )
        })}
      </div>
      <button style={S.btnBack} onClick={onBack}><ChevronLeft size={14}/> Volver</button>
    </div>
  )
}

// ─── PASO 3: Elegir horario ───────────────────────────────────────────────────
function PasoHorario({ dia, onNext, onBack }) {
  const [ocupados, setOcupados] = useState([])
  const [loading, setLoading]   = useState(true)
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    const iso = dia.toISOString().split('T')[0] + 'T00:00:00'
    turnosAPI.getOcupados(iso)
      .then(res => {
        const horas = res.data.map(t => t.fechaHora.substring(11, 16))
        setOcupados(horas)
      })
      .catch(() => setOcupados([]))
      .finally(() => setLoading(false))
  }, [dia])

  const ahora = new Date()

  return (
    <div>
      <div style={S.stepTitle}>Elegí un horario</div>
      <div style={S.stepSub}>
        {format(dia, "EEEE d 'de' MMMM", { locale: es })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '1.25rem' }}>
          {TODOS_HORARIOS.map(hora => {
            const estaOcupado = ocupados.includes(hora)
            // Si es hoy, bloquear horarios pasados
            const [h, m] = hora.split(':').map(Number)
            const horaDate = new Date(dia)
            horaDate.setHours(h, m, 0, 0)
            const esPasado = isToday(dia) && horaDate <= ahora
            const bloqueado = estaOcupado || esPasado
            const esSelec = seleccionado === hora

            return (
              <button key={hora} disabled={bloqueado}
                onClick={() => !bloqueado && setSeleccionado(hora)}
                style={{
                  padding: '12px 8px', borderRadius: '8px',
                  fontFamily: "'Bebas Neue',cursive", fontSize: '1.2rem',
                  letterSpacing: '0.05em', cursor: bloqueado ? 'not-allowed' : 'pointer',
                  border: esSelec ? '1px solid #E8192C'
                        : bloqueado ? '1px solid rgba(59,130,246,0.06)'
                        : '1px solid rgba(59,130,246,0.15)',
                  background: esSelec ? 'rgba(232,25,44,0.12)'
                            : bloqueado ? 'rgba(5,12,28,0.2)'
                            : 'rgba(5,12,28,0.5)',
                  color: esSelec ? '#F8F8F8' : bloqueado ? '#1e293b' : '#93c5fd',
                  transition: 'all 0.15s',
                  boxShadow: esSelec ? '0 0 12px rgba(232,25,44,0.25)' : 'none',
                  position: 'relative',
                }}>
                {hora}
                {estaOcupado && !esPasado && (
                  <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.45rem', fontFamily: "'Barlow',sans-serif", color: '#475569',
                    letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    OCUPADO
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={S.btnBack} onClick={onBack}><ChevronLeft size={14}/> Volver</button>
        <button style={{ ...S.btnPrimary, opacity: seleccionado ? 1 : 0.4 }}
          disabled={!seleccionado}
          onClick={() => seleccionado && onNext(seleccionado)}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ─── PASO 4: Datos del cliente ────────────────────────────────────────────────
function PasoDatos({ servicio, dia, hora, onNext, onBack }) {
  const [nombre, setNombre]     = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleReservar = async () => {
    setError('')
    if (!nombre.trim() || !telefono.trim()) {
      setError('Completá tu nombre y teléfono para continuar'); return
    }
    if (telefono.replace(/\D/g,'').length < 10) {
      setError('Ingresá un número de WhatsApp válido'); return
    }
    try {
      setLoading(true)
      const fechaHora = `${format(dia,'yyyy-MM-dd')}T${hora}:00`
      const res = await turnosAPI.crear({ clienteNombre: nombre.trim(),
        clienteTelefono: telefono.replace(/\D/g,''), fechaHora, servicio, notas })
      onNext(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al reservar. Intentá con otro horario.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={S.stepTitle}>Tus datos</div>
      <div style={S.stepSub}>Casi listo — solo necesitamos esto</div>

      {/* Resumen del turno */}
      <div style={{ background:'rgba(232,25,44,0.06)', border:'1px solid rgba(232,25,44,0.2)',
        borderRadius:'8px', padding:'12px 16px', marginBottom:'1.25rem',
        display:'flex', flexDirection:'column', gap:'6px' }}>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', color:'#93c5fd', fontSize:'0.82rem' }}>
          <Scissors size={13}/> <span style={{ fontFamily:"'Oswald',sans-serif" }}>{servicio}</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', color:'#93c5fd', fontSize:'0.82rem' }}>
          <Calendar size={13}/>
          <span style={{ fontFamily:"'Oswald',sans-serif" }}>
            {format(dia,"EEEE d 'de' MMMM",{locale:es})} — {hora}hs
          </span>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.25rem' }}>
        <div>
          <label style={S.label}>Tu nombre *</label>
          <div style={{ position:'relative' }}>
            <User size={14} style={{ position:'absolute', left:'12px', top:'50%',
              transform:'translateY(-50%)', color:'#475569' }}/>
            <input style={{ ...S.input, paddingLeft:'2.2rem' }}
              placeholder="Juan Pérez"
              value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={S.label}>
            WhatsApp * <span style={{ color:'#E8192C' }}>ej: 5492644123456</span>
          </label>
          <div style={{ position:'relative' }}>
            <Phone size={14} style={{ position:'absolute', left:'12px', top:'50%',
              transform:'translateY(-50%)', color:'#475569' }}/>
            <input style={{ ...S.input, paddingLeft:'2.2rem' }}
              placeholder="5492644123456" type="tel"
              value={telefono} onChange={e => setTelefono(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={S.label}>Alguna aclaración (opcional)</label>
          <textarea style={{ ...S.input, resize:'none', height:'72px' }}
            placeholder="Ej: quiero el flequillo corto..."
            value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(232,25,44,0.1)', border:'1px solid rgba(232,25,44,0.3)',
          color:'#fb7185', padding:'10px 14px', borderRadius:'6px',
          fontSize:'0.82rem', marginBottom:'1rem' }}>
          ✕ {error}
        </div>
      )}

      <div style={{ display:'flex', gap:'8px' }}>
        <button style={S.btnBack} onClick={onBack}><ChevronLeft size={14}/> Volver</button>
        <button style={S.btnPrimary} onClick={handleReservar} disabled={loading}>
          {loading ? <><Loader size={15} className="animate-spin"/> Reservando...</> : '💈 Confirmar Reserva'}
        </button>
      </div>
    </div>
  )
}

// ─── PASO 5: Éxito ────────────────────────────────────────────────────────────
function PasoExito({ turno }) {
  return (
    <div style={{ textAlign:'center', padding:'1rem 0' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'50%', margin:'0 auto 1.25rem',
        background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 0 30px rgba(34,197,94,0.2)' }}>
        <CheckCircle size={40} style={{ color:'#86efac' }} />
      </div>

      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem',
        letterSpacing:'0.05em', color:'#F8F8F8', marginBottom:'6px' }}>
        ¡TURNO RESERVADO!
      </div>
      <p style={{ color:'#64748b', fontSize:'0.82rem', fontFamily:"'Oswald',sans-serif",
        letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'1.5rem' }}>
        Te avisamos por WhatsApp cuando se confirme
      </p>

      {/* Resumen */}
      <div style={{ background:'rgba(10,22,40,0.8)', border:'1px solid rgba(59,130,246,0.15)',
        borderRadius:'10px', padding:'1.25rem', textAlign:'left', marginBottom:'1.5rem' }}>
        {[
          { icon:'✂️', label:'Servicio', value: turno.servicio },
          { icon:'📅', label:'Fecha y hora', value: turno.fechaHora
              ? format(new Date(turno.fechaHora),"EEEE d 'de' MMMM 'a las' HH:mm'hs'",{locale:es})
              : '—' },
          { icon:'👤', label:'Nombre', value: turno.clienteNombre },
          { icon:'📱', label:'WhatsApp', value: turno.clienteTelefono },
        ].map(row => (
          <div key={row.label} style={{ display:'flex', gap:'10px', alignItems:'flex-start',
            padding:'8px 0', borderBottom:'1px solid rgba(59,130,246,0.08)' }}>
            <span style={{ fontSize:'1rem', minWidth:'20px' }}>{row.icon}</span>
            <div>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.62rem',
                letterSpacing:'0.1em', color:'#475569', textTransform:'uppercase' }}>{row.label}</div>
              <div style={{ color:'#F8F8F8', fontSize:'0.88rem', marginTop:'1px', textTransform:'capitalize' }}>
                {row.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
        borderRadius:'8px', padding:'12px 16px', fontSize:'0.8rem', color:'#93c5fd',
        fontFamily:"'Barlow',sans-serif", lineHeight:1.5 }}>
        📲 Recibirás un mensaje de WhatsApp cuando el peluquero confirme tu turno.
        Si necesitás cancelar, respondé <strong>CANCELAR</strong> en ese mensaje.
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Reservar() {
  const [paso, setPaso]           = useState(0)
  const [servicio, setServicio]   = useState(null)
  const [dia, setDia]             = useState(null)
  const [hora, setHora]           = useState(null)
  const [turnoCreado, setTurno]   = useState(null)
  const [config, setConfig]       = useState({ barbershopName: 'BarberApp' })

  useEffect(() => {
    try {
      const c = localStorage.getItem('barbershop_config')
      if (c) setConfig(JSON.parse(c))
    } catch {}
  }, [])

  const irAPaso = (n) => { setPaso(n); window.scrollTo(0,0) }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <div style={S.logoBox}><Scissors size={18} style={{ color:'#fff' }}/></div>
          <div>
            <div style={{ ...S.logoText, background:'linear-gradient(90deg,#F8F8F8,#93c5fd)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              BARBER<span style={{ WebkitTextFillColor:'#E8192C' }}>APP</span>
            </div>
            <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.58rem',
              color:'#475569', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              {config.barbershopName || 'Reserva tu turno'}
            </div>
          </div>
        </div>
      </div>

      <div style={S.container}>
        {/* Barra de progreso — solo en pasos 0-3 */}
        {paso < 4 && <BarraProgreso paso={paso} />}

        <div style={S.card}>
          {paso === 0 && (
            <PasoServicio onNext={v => { setServicio(v); irAPaso(1) }} />
          )}
          {paso === 1 && (
            <PasoDia
              onNext={v => { setDia(v); irAPaso(2) }}
              onBack={() => irAPaso(0)} />
          )}
          {paso === 2 && (
            <PasoHorario
              dia={dia}
              onNext={v => { setHora(v); irAPaso(3) }}
              onBack={() => irAPaso(1)} />
          )}
          {paso === 3 && (
            <PasoDatos
              servicio={servicio} dia={dia} hora={hora}
              onNext={t => { setTurno(t); irAPaso(4) }}
              onBack={() => irAPaso(2)} />
          )}
          {paso === 4 && turnoCreado && (
            <PasoExito turno={turnoCreado} />
          )}
        </div>

        {/* Nuevo turno desde éxito */}
        {paso === 4 && (
          <button
            onClick={() => { setPaso(0); setServicio(null); setDia(null); setHora(null); setTurno(null) }}
            style={{ ...S.btnBack, margin:'1rem auto', display:'flex' }}>
            + Reservar otro turno
          </button>
        )}
      </div>
    </div>
  )
}
