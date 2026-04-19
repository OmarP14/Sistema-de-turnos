import { useState, useEffect } from 'react'
import { Save, CheckCircle, X } from 'lucide-react'
import { addDays, startOfToday, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { disponibilidadAPI } from '../utils/api'

const SERVICIOS_DEFAULT = ['Corte de pelo','Barba','Corte + Barba','Degradé','Coloración']

const DIAS_SEMANA = [
  { num: 1, label: 'LUN' },
  { num: 2, label: 'MAR' },
  { num: 3, label: 'MIÉ' },
  { num: 4, label: 'JUE' },
  { num: 5, label: 'VIE' },
  { num: 6, label: 'SÁB' },
]

const Label = ({ children }) => (
  <label style={{ display:'block', fontFamily:"'Oswald',sans-serif", fontSize:'0.7rem',
    letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', marginBottom:'8px' }}>
    {children}
  </label>
)

const Section = ({ title, children }) => (
  <div style={{ background:'#111', border:'1px solid #1a1a1a', borderTop:'2px solid #E8192C',
    borderRadius:'2px', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
    <h3 style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.8rem', letterSpacing:'0.12em',
      textTransform:'uppercase', color:'#666', marginBottom:'4px' }}>{title}</h3>
    {children}
  </div>
)

export default function Configuracion() {
  const [guardado, setGuardado] = useState(false)
  const [config, setConfig] = useState({
    barbershopName:'El Maestro', ownerPhone:'',
    horarios:{ inicio:'09:00', fin:'19:00', duracion:30 },
    servicios:SERVICIOS_DEFAULT, nuevoServicio:'',
  })

  // Estado de disponibilidad (viene del backend)
  const [diasLaborales, setDiasLaborales] = useState([1,2,3,4,5,6])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [guardandoDias, setGuardandoDias] = useState(false)
  const [mensajeDias, setMensajeDias] = useState('')

  // Cargar config local
  useEffect(() => {
    try {
      const c = localStorage.getItem('barbershop_config')
      if (c) setConfig(p => ({ ...p, ...JSON.parse(c), nuevoServicio:'' }))
    } catch {}
  }, [])

  // Cargar disponibilidad del backend
  useEffect(() => {
    disponibilidadAPI.get()
      .then(res => {
        setDiasLaborales(res.data.diasLaborales || [1,2,3,4,5,6])
        setFechasBloqueadas(res.data.fechasBloqueadas || [])
      })
      .catch(() => {})
  }, [])

  // ── Config local ───────────────────────────────────────────────────────────
  const set  = (k,v) => setConfig(f => ({ ...f, [k]:v }))
  const setH = (k,v) => setConfig(f => ({ ...f, horarios:{ ...f.horarios, [k]:v } }))
  const addSvc = () => {
    if (!config.nuevoServicio.trim()) return
    set('servicios', [...config.servicios, config.nuevoServicio.trim()])
    set('nuevoServicio', '')
  }
  const delSvc = (i) => set('servicios', config.servicios.filter((_,j) => j !== i))

  const slots = (() => {
    const [hI,mI] = config.horarios.inicio.split(':').map(Number)
    const [hF,mF] = config.horarios.fin.split(':').map(Number)
    const dur = parseInt(config.horarios.duracion), ini = hI*60+mI, fin = hF*60+mF, r = []
    for (let t = ini; t < fin; t += dur) {
      r.push(`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`)
    }
    return r
  })()

  const guardar = () => {
    const { nuevoServicio, ...d } = config
    localStorage.setItem('barbershop_config', JSON.stringify(d))
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  // ── Días laborales ─────────────────────────────────────────────────────────
  const toggleDia = async (numDia) => {
    const nuevos = diasLaborales.includes(numDia)
      ? diasLaborales.filter(d => d !== numDia)
      : [...diasLaborales, numDia].sort((a,b) => a-b)

    setDiasLaborales(nuevos)
    setGuardandoDias(true)
    try {
      await disponibilidadAPI.updateDias(nuevos)
      setMensajeDias('Guardado ✓')
      setTimeout(() => setMensajeDias(''), 2000)
    } catch {
      setDiasLaborales(diasLaborales) // revertir
      setMensajeDias('Error al guardar')
    } finally {
      setGuardandoDias(false)
    }
  }

  // ── Fechas bloqueadas ──────────────────────────────────────────────────────
  const toggleFecha = async (fechaStr) => {
    const estaBloqueada = fechasBloqueadas.includes(fechaStr)
    if (estaBloqueada) {
      setFechasBloqueadas(prev => prev.filter(f => f !== fechaStr))
      try {
        await disponibilidadAPI.desbloquear(fechaStr)
      } catch {
        setFechasBloqueadas(prev => [...prev, fechaStr])
      }
    } else {
      setFechasBloqueadas(prev => [...prev, fechaStr])
      try {
        await disponibilidadAPI.bloquear(fechaStr)
      } catch {
        setFechasBloqueadas(prev => prev.filter(f => f !== fechaStr))
      }
    }
  }

  // Próximos 60 días que sean días laborales
  const proximosDias = Array.from({ length: 60 }, (_, i) => addDays(startOfToday(), i + 1))
    .filter(d => diasLaborales.includes(d.getDay()))

  return (
    <div style={{ maxWidth:'600px', margin:'0 auto', display:'flex', flexDirection:'column',
      gap:'1rem', paddingBottom:'90px' }} className="animate-fade-up">

      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
        <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'#F8F8F8',
          letterSpacing:'0.05em' }}>CONFIGURACIÓN</h2>
      </div>

      {/* ── Datos de la Barbería ── */}
      <Section title="Datos de la Barbería">
        <div><Label>Nombre</Label>
          <input className="input-field" placeholder="Ej: Barbería El Maestro"
            value={config.barbershopName} onChange={e => set('barbershopName', e.target.value)} /></div>
        <div><Label>Teléfono del peluquero (WhatsApp)</Label>
          <input className="input-field" placeholder="5492644123456"
            value={config.ownerPhone} onChange={e => set('ownerPhone', e.target.value)} /></div>
      </Section>

      {/* ── Días de Trabajo ── */}
      <Section title="Días de Trabajo">
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.8rem', color:'#64748b', margin:0 }}>
          Activá los días en que atendés. Los días desactivados no aparecerán para los clientes.
        </p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {DIAS_SEMANA.map(({ num, label }) => {
            const activo = diasLaborales.includes(num)
            return (
              <button
                key={num}
                onClick={() => !guardandoDias && toggleDia(num)}
                disabled={guardandoDias}
                style={{
                  padding:'10px 14px',
                  fontFamily:"'Oswald',sans-serif", fontSize:'0.8rem',
                  letterSpacing:'0.12em', fontWeight:600,
                  borderRadius:'4px', cursor: guardandoDias ? 'wait' : 'pointer',
                  border: activo ? '2px solid #E8192C' : '2px solid #1a1a1a',
                  background: activo ? 'rgba(232,25,44,0.15)' : 'rgba(255,255,255,0.03)',
                  color: activo ? '#fb7185' : '#475569',
                  transition:'all 0.2s',
                  boxShadow: activo ? '0 0 12px rgba(232,25,44,0.2)' : 'none',
                  minWidth:'54px',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        {mensajeDias && (
          <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.78rem',
            color: mensajeDias.includes('Error') ? '#fb7185' : '#86efac' }}>
            {mensajeDias}
          </span>
        )}
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.75rem', color:'#334155', margin:0 }}>
          Días activos: {diasLaborales.length === 0
            ? 'ninguno'
            : DIAS_SEMANA.filter(d => diasLaborales.includes(d.num)).map(d => d.label).join(', ')}
        </p>
      </Section>

      {/* ── Bloquear Fechas Específicas ── */}
      <Section title="Bloquear Fechas Específicas">
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.8rem', color:'#64748b', margin:0 }}>
          Tocá un día para bloquearlo. Los días bloqueados no estarán disponibles para reservas.
        </p>

        {proximosDias.length === 0 ? (
          <p style={{ color:'#475569', fontFamily:"'Barlow',sans-serif", fontSize:'0.82rem' }}>
            No hay días laborales activos para bloquear.
          </p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
            {proximosDias.map(dia => {
              const fechaStr = format(dia, 'yyyy-MM-dd')
              const bloqueado = fechasBloqueadas.includes(fechaStr)
              const diaNombre = format(dia, 'EEE', { locale: es }).toUpperCase().replace('.','')
              const diaMes = format(dia, 'd MMM', { locale: es })

              return (
                <button
                  key={fechaStr}
                  onClick={() => toggleFecha(fechaStr)}
                  title={bloqueado ? 'Click para desbloquear' : 'Click para bloquear'}
                  style={{
                    padding:'8px 4px',
                    borderRadius:'6px',
                    border: bloqueado ? '1px solid rgba(232,25,44,0.5)' : '1px solid #1a1a1a',
                    background: bloqueado ? 'rgba(232,25,44,0.12)' : 'rgba(255,255,255,0.03)',
                    cursor:'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                    position:'relative', transition:'all 0.15s',
                  }}
                >
                  {bloqueado && (
                    <div style={{
                      position:'absolute', top:'4px', right:'4px',
                      background:'#E8192C', borderRadius:'50%',
                      width:'14px', height:'14px',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <X size={9} style={{ color:'#fff' }} />
                    </div>
                  )}
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.58rem',
                    letterSpacing:'0.1em',
                    color: bloqueado ? '#E8192C' : '#475569' }}>
                    {diaNombre}
                  </span>
                  <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.2rem',
                    lineHeight:1,
                    color: bloqueado ? '#fb7185' : '#F8F8F8' }}>
                    {format(dia, 'd')}
                  </span>
                  <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.6rem',
                    color: bloqueado ? '#E8192C' : '#334155',
                    textTransform:'uppercase' }}>
                    {format(dia, 'MMM', { locale: es })}
                  </span>
                  {bloqueado && (
                    <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.5rem',
                      letterSpacing:'0.08em', color:'#E8192C', marginTop:'1px' }}>
                      BLOQUEADO
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {fechasBloqueadas.length > 0 && (
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.75rem', color:'#64748b', margin:0 }}>
            {fechasBloqueadas.length} día{fechasBloqueadas.length > 1 ? 's' : ''} bloqueado{fechasBloqueadas.length > 1 ? 's' : ''}
          </p>
        )}
      </Section>

      {/* ── Horario de Atención ── */}
      <Section title="Horario de Atención">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          <div><Label>Apertura</Label>
            <input type="time" className="input-field" value={config.horarios.inicio}
              onChange={e => setH('inicio', e.target.value)} /></div>
          <div><Label>Cierre</Label>
            <input type="time" className="input-field" value={config.horarios.fin}
              onChange={e => setH('fin', e.target.value)} /></div>
          <div><Label>Duración</Label>
            <select className="input-field" value={config.horarios.duracion}
              onChange={e => setH('duracion', e.target.value)}>
              {[15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}
            </select></div>
        </div>
        <div>
          <Label>Vista previa de horarios</Label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
            {slots.map(h => (
              <span key={h} style={{ background:'rgba(232,25,44,0.08)', color:'#E8192C',
                border:'1px solid rgba(232,25,44,0.2)', padding:'2px 8px', borderRadius:'2px',
                fontSize:'0.7rem', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.05em' }}>{h}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Servicios ── */}
      <Section title="Servicios">
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {config.servicios.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px',
              background:'rgba(30,111,217,0.08)', border:'1px solid rgba(30,111,217,0.2)', borderRadius:'2px' }}>
              <span style={{ color:'#F8F8F8', fontSize:'0.82rem' }}>{s}</span>
              <button onClick={() => delSvc(i)} style={{ color:'#E8192C', background:'none',
                border:'none', cursor:'pointer', fontSize:'0.7rem', lineHeight:1 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input className="input-field" placeholder="Nuevo servicio..."
            value={config.nuevoServicio} onChange={e => set('nuevoServicio', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSvc()} />
          <button onClick={addSvc} className="btn-primary" style={{ whiteSpace:'nowrap' }}>+ AGREGAR</button>
        </div>
      </Section>

      <button onClick={guardar} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
        {guardado ? <><CheckCircle size={15}/> GUARDADO</> : <><Save size={15}/> GUARDAR CONFIGURACIÓN</>}
      </button>

      <p style={{ color:'#94a3b8', fontSize:'0.78rem', textAlign:'center', fontFamily:"'Barlow',sans-serif",
        background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
        borderRadius:'4px', padding:'10px 14px' }}>
        ⚠ Los días de trabajo y fechas bloqueadas se guardan automáticamente al hacer click.
      </p>
    </div>
  )
}
