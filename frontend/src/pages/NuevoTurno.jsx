import { useState, useEffect } from 'react'
import { turnosAPI, serviciosAPI, disponibilidadAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader } from 'lucide-react'
import { format, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Franjas horarias ─────────────────────────────────────────────────────────
function generarFranja(desdeH, hastaH) {
  const slots = []
  for (let t = desdeH * 60; t <= hastaH * 60; t += 30)
    slots.push(`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`)
  return slots
}
const FRANJA_MANANA = generarFranja(9, 13)
const FRANJA_TARDE  = generarFranja(17, 22)

const Label = ({children}) => (
  <label style={{ display:'block', fontFamily:"'Oswald',sans-serif", fontSize:'0.72rem',
    letterSpacing:'0.12em', textTransform:'uppercase', color:'#666', marginBottom:'8px' }}>
    {children}
  </label>
)

// ─── Selector de fecha como calendario ───────────────────────────────────────
function CalendarioFecha({ fechaSeleccionada, onSelect, fechasBloqueadas, diasLaborales }) {
  const hoy = startOfToday()
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const año = mesActual.getFullYear()
  const mes = mesActual.getMonth()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const offset = (mesActual.getDay() + 6) % 7

  const mesAnterior = () => setMesActual(new Date(año, mes - 1, 1))
  const mesSiguiente = () => setMesActual(new Date(año, mes + 1, 1))

  return (
    <div style={{ background:'#0d0d0d', border:'1px solid #222', borderRadius:'6px', padding:'12px' }}>
      {/* Navegación mes */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <button onClick={mesAnterior} style={{ background:'none', border:'none', color:'#64748b',
          cursor:'pointer', fontSize:'1rem', padding:'4px 8px' }}>‹</button>
        <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1rem', letterSpacing:'0.1em',
          color:'#F8F8F8', textTransform:'capitalize' }}>
          {format(mesActual, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={mesSiguiente} style={{ background:'none', border:'none', color:'#64748b',
          cursor:'pointer', fontSize:'1rem', padding:'4px 8px' }}>›</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px' }}>
        {/* Cabecera */}
        {['L','M','X','J','V','S','D'].map(d => (
          <div key={d} style={{ textAlign:'center', fontFamily:"'Oswald',sans-serif",
            fontSize:'0.58rem', letterSpacing:'0.1em', color:'#334155', paddingBottom:'4px' }}>{d}</div>
        ))}

        {/* Celdas vacías */}
        {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}

        {/* Días */}
        {Array.from({ length: diasEnMes }, (_, i) => {
          const dia = new Date(año, mes, i + 1)
          const fechaStr = format(dia, 'yyyy-MM-dd')
          const esPasado = dia < hoy
          const esLaboral = diasLaborales.includes(dia.getDay())
          const estaBloqueado = fechasBloqueadas.includes(fechaStr)
          const seleccionado = fechaStr === fechaSeleccionada
          const clickeable = !esPasado && esLaboral && !estaBloqueado

          if (!clickeable) return (
            <div key={fechaStr} style={{ textAlign:'center', padding:'6px 2px',
              fontFamily:"'Bebas Neue',cursive", fontSize:'1rem',
              color: estaBloqueado && !esPasado ? 'rgba(232,25,44,0.3)' : '#1e2d3d' }}>
              {i + 1}
            </div>
          )

          return (
            <button key={fechaStr} onClick={() => onSelect(fechaStr)}
              style={{
                padding:'6px 2px', borderRadius:'5px', cursor:'pointer',
                border: seleccionado ? '1px solid #E8192C' : '1px solid #1a1a1a',
                background: seleccionado ? 'rgba(232,25,44,0.2)' : 'rgba(255,255,255,0.03)',
                fontFamily:"'Bebas Neue',cursive", fontSize:'1rem',
                color: seleccionado ? '#fb7185' : '#F8F8F8',
                transition:'all 0.15s',
              }}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Selector de horarios con franjas ────────────────────────────────────────
function SelectorHorario({ horaSeleccionada, onSelect, ocupados }) {
  const franjas = [
    { label: '🌅 Mañana', slots: FRANJA_MANANA },
    { label: '🌆 Tarde',  slots: FRANJA_TARDE  },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
      {franjas.map(franja => (
        <div key={franja.label}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.65rem',
            letterSpacing:'0.12em', textTransform:'uppercase', color:'#475569', marginBottom:'6px' }}>
            {franja.label}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'5px' }}>
            {franja.slots.map(hora => {
              const ocupado = ocupados.includes(hora)
              const selec = horaSeleccionada === hora
              return (
                <button key={hora} disabled={ocupado} onClick={() => !ocupado && onSelect(hora)}
                  style={{
                    padding:'7px 2px', borderRadius:'5px', cursor: ocupado ? 'not-allowed' : 'pointer',
                    fontFamily:"'Bebas Neue',cursive", fontSize:'0.95rem', letterSpacing:'0.04em',
                    border: selec ? '1px solid #E8192C' : ocupado ? '1px solid #111' : '1px solid #222',
                    background: selec ? 'rgba(232,25,44,0.2)' : ocupado ? 'rgba(5,12,28,0.3)' : '#0d0d0d',
                    color: selec ? '#fb7185' : ocupado ? '#1e293b' : '#93c5fd',
                    transition:'all 0.15s', position:'relative',
                  }}>
                  {hora}
                  {ocupado && (
                    <div style={{ position:'absolute', bottom:'2px', left:'50%', transform:'translateX(-50%)',
                      fontSize:'0.38rem', fontFamily:"'Barlow',sans-serif", color:'#334155',
                      letterSpacing:'0.04em', textTransform:'uppercase' }}>OCU</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NuevoTurno() {
  const navigate = useNavigate()
  const hoy = startOfToday()

  const [loading, setLoading]   = useState(false)
  const [exito, setExito]       = useState(false)
  const [error, setError]       = useState('')
  const [servicios, setServicios]             = useState([])
  const [diasLaborales, setDiasLaborales]     = useState([1,2,3,4,5,6])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [ocupados, setOcupados]               = useState([])
  const [cargandoOcupados, setCargandoOcupados] = useState(false)

  const [form, setForm] = useState({
    clienteNombre: '', clienteTelefono: '',
    fecha: format(hoy, 'yyyy-MM-dd'), hora: '', servicio: '', notas: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Cargar servicios y disponibilidad al montar
  useEffect(() => {
    serviciosAPI.get()
      .then(res => {
        const lista = res.data.servicios || []
        setServicios(lista)
        if (lista.length) set('servicio', lista[0])
      }).catch(() => {})

    disponibilidadAPI.get()
      .then(res => {
        setDiasLaborales(res.data.diasLaborales || [1,2,3,4,5,6])
        setFechasBloqueadas(res.data.fechasBloqueadas || [])
      }).catch(() => {})
  }, [])

  // Cargar ocupados cuando cambia la fecha
  useEffect(() => {
    if (!form.fecha) return
    setCargandoOcupados(true)
    set('hora', '')
    turnosAPI.getOcupados(`${form.fecha}T00:00:00`)
      .then(res => setOcupados(res.data.map(t => t.fechaHora.substring(11, 16))))
      .catch(() => setOcupados([]))
      .finally(() => setCargandoOcupados(false))
  }, [form.fecha])

  const handleSubmit = async () => {
    setError('')
    if (!form.clienteNombre || !form.clienteTelefono || !form.fecha || !form.hora || !form.servicio) {
      setError('Completá todos los campos obligatorios'); return
    }
    const soloNumeros = form.clienteTelefono.replace(/\D/g, '')
    if (soloNumeros.length < 10) {
      setError('Ingresá código de área + número (ej: 2644819470)'); return
    }
    try {
      setLoading(true)
      await turnosAPI.crear({
        clienteNombre:    form.clienteNombre.trim(),
        clienteTelefono:  '54' + soloNumeros,
        fechaHora:        `${form.fecha}T${form.hora}:00`,
        servicio:         form.servicio,
        notas:            form.notas,
      })
      setExito(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.error || 'Error al crear el turno')
    } finally { setLoading(false) }
  }

  if (exito) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'50vh', gap:'16px' }}>
      <div style={{ border:'2px solid #1E6FD9', padding:'24px', borderRadius:'2px',
        boxShadow:'0 0 40px rgba(30,111,217,0.3)' }}>
        <CheckCircle size={56} style={{ color:'#1E6FD9' }} />
      </div>
      <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem',
        letterSpacing:'0.05em', color:'#F8F8F8' }}>TURNO CREADO</h2>
      <p style={{ color:'#555', fontFamily:"'Oswald',sans-serif",
        letterSpacing:'0.08em', fontSize:'0.8rem' }}>REDIRIGIENDO AL DASHBOARD...</p>
    </div>
  )

  return (
    <div style={{ maxWidth:'520px', margin:'0 auto', paddingBottom:'90px' }} className="animate-fade-up">

      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem',
            color:'#F8F8F8', letterSpacing:'0.05em' }}>NUEVO TURNO</h2>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* Nombre */}
        <div>
          <Label>Nombre del cliente *</Label>
          <input className="input-field" placeholder="Juan Pérez"
            value={form.clienteNombre} onChange={e => set('clienteNombre', e.target.value)} />
        </div>

        {/* Teléfono */}
        <div>
          <Label>WhatsApp del cliente *</Label>
          <div style={{ display:'flex' }}>
            <div style={{
              background:'rgba(59,130,246,0.08)', border:'1px solid #222', borderRight:'none',
              borderRadius:'4px 0 0 4px', padding:'0 10px',
              display:'flex', alignItems:'center',
              fontFamily:"'Barlow',sans-serif", fontSize:'0.9rem', color:'#64748b',
              whiteSpace:'nowrap', userSelect:'none',
            }}>+54</div>
            <input className="input-field" placeholder="2644819470" type="tel"
              style={{ borderRadius:'0 4px 4px 0' }}
              value={form.clienteTelefono} onChange={e => set('clienteTelefono', e.target.value)} />
          </div>
        </div>

        {/* Servicio */}
        <div>
          <Label>Servicio *</Label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
            {servicios.map(s => (
              <button key={s} onClick={() => set('servicio', s)}
                style={{
                  padding:'10px 14px', borderRadius:'4px', textAlign:'left', cursor:'pointer',
                  border: form.servicio === s ? '1px solid #E8192C' : '1px solid #222',
                  background: form.servicio === s ? 'rgba(232,25,44,0.08)' : '#0d0d0d',
                  color: form.servicio === s ? '#F8F8F8' : '#666',
                  fontFamily:"'Barlow',sans-serif", fontSize:'0.85rem', transition:'all 0.2s',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <Label>Fecha *</Label>
          <CalendarioFecha
            fechaSeleccionada={form.fecha}
            onSelect={v => set('fecha', v)}
            fechasBloqueadas={fechasBloqueadas}
            diasLaborales={diasLaborales}
          />
          {form.fecha && (
            <p style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.72rem',
              letterSpacing:'0.08em', color:'#64748b', marginTop:'6px', textTransform:'capitalize' }}>
              {format(new Date(form.fecha + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}
            </p>
          )}
        </div>

        {/* Horario */}
        <div>
          <Label>Horario *
            {cargandoOcupados && <Loader size={11} style={{ marginLeft:'6px', display:'inline', animation:'spin 1s linear infinite' }} />}
          </Label>
          <SelectorHorario
            horaSeleccionada={form.hora}
            onSelect={v => set('hora', v)}
            ocupados={ocupados}
          />
        </div>

        {/* Notas */}
        <div>
          <Label>Notas (opcional)</Label>
          <textarea className="input-field" style={{ resize:'none', height:'64px' }}
            placeholder="Alguna preferencia especial..."
            value={form.notas} onChange={e => set('notas', e.target.value)} />
        </div>

        {error && (
          <div style={{ background:'rgba(232,25,44,0.08)', border:'1px solid rgba(232,25,44,0.3)',
            color:'#ff4d5e', padding:'10px 14px', borderRadius:'4px',
            fontSize:'0.82rem', fontFamily:"'Barlow',sans-serif" }}>
            ✕ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary"
          style={{ width:'100%', justifyContent:'center', fontSize:'0.9rem' }}>
          {loading
            ? <><Loader size={15} className="animate-spin"/> CREANDO...</>
            : '✂ CREAR TURNO'}
        </button>

      </div>
    </div>
  )
}
