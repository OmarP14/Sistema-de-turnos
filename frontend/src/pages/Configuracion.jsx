import { useState, useEffect } from 'react'
import { Save, CheckCircle, X } from 'lucide-react'
import { addDays, startOfToday, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { disponibilidadAPI, barberiaAPI } from '../utils/api'

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
    servicios:SERVICIOS_DEFAULT, nuevoServicio:'',
  })

  // Estado de disponibilidad (viene del backend)
  const [diasLaborales, setDiasLaborales] = useState([1,2,3,4,5,6])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [guardandoDias, setGuardandoDias] = useState(false)
  const [mensajeDias, setMensajeDias] = useState('')

  // Configuración de la barbería (viene del backend)
  const [barberia, setBarberia] = useState({
    barbershop_name: '', owner_phone: '',
    whatsapp_phone_number_id: '', whatsapp_access_token: '',
  })
  const [guardandoBarberia, setGuardandoBarberia] = useState(false)
  const [mensajeBarberia, setMensajeBarberia] = useState('')

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

  // Cargar config de barbería del backend
  useEffect(() => {
    barberiaAPI.get()
      .then(res => setBarberia(prev => ({ ...prev, ...res.data })))
      .catch(() => {})
  }, [])

  const guardarBarberia = async () => {
    setGuardandoBarberia(true)
    try {
      await barberiaAPI.save(barberia)
      setMensajeBarberia('ok')
      setTimeout(() => setMensajeBarberia(''), 2500)
    } catch {
      setMensajeBarberia('error')
      setTimeout(() => setMensajeBarberia(''), 2500)
    } finally {
      setGuardandoBarberia(false)
    }
  }

  // ── Config local ───────────────────────────────────────────────────────────
  const set  = (k,v) => setConfig(f => ({ ...f, [k]:v }))
  const addSvc = () => {
    if (!config.nuevoServicio.trim()) return
    set('servicios', [...config.servicios, config.nuevoServicio.trim()])
    set('nuevoServicio', '')
  }
  const delSvc = (i) => set('servicios', config.servicios.filter((_,j) => j !== i))

  const guardar = () => {
    const { nuevoServicio: _, ...d } = config
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

      {/* ── Configuración WhatsApp ── */}
      <Section title="Barbería y WhatsApp">
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.8rem', color:'#64748b', margin:0 }}>
          Ingresá los datos de tu cuenta de WhatsApp Business. Se obtienen desde Meta for Developers.
        </p>
        <div><Label>Nombre de la Barbería</Label>
          <input className="input-field" placeholder="Ej: Luxo Barbershop"
            value={barberia.barbershop_name || ''}
            onChange={e => setBarberia(p => ({ ...p, barbershop_name: e.target.value }))} /></div>
        <div><Label>Teléfono del Barbero (WhatsApp) — sin + ni espacios</Label>
          <input className="input-field" placeholder="542644819470"
            value={barberia.owner_phone || ''}
            onChange={e => setBarberia(p => ({ ...p, owner_phone: e.target.value }))} /></div>
        <div><Label>WhatsApp Phone Number ID</Label>
          <input className="input-field" placeholder="Ej: 969778306228834"
            value={barberia.whatsapp_phone_number_id || ''}
            onChange={e => setBarberia(p => ({ ...p, whatsapp_phone_number_id: e.target.value }))} /></div>
        <div><Label>WhatsApp Access Token</Label>
          <textarea className="input-field" rows={3}
            placeholder="EAADvvm..."
            style={{ resize:'vertical', fontFamily:'monospace', fontSize:'0.72rem' }}
            value={barberia.whatsapp_access_token || ''}
            onChange={e => setBarberia(p => ({ ...p, whatsapp_access_token: e.target.value }))} /></div>
        <button
          onClick={guardarBarberia}
          disabled={guardandoBarberia}
          className="btn-primary"
          style={{ alignSelf:'flex-start' }}
        >
          {guardandoBarberia ? 'Guardando…'
            : mensajeBarberia === 'ok' ? <><CheckCircle size={14}/> GUARDADO</>
            : mensajeBarberia === 'error' ? '✕ Error al guardar'
            : <><Save size={14}/> GUARDAR WHATSAPP</>}
        </button>
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.72rem', color:'#475569', margin:0 }}>
          El token expira cada ~24 h. Renovarlo en Meta for Developers → WhatsApp → API Setup.
        </p>
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
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.8rem', color:'#64748b', margin:0 }}>
          Turnos cada 30 minutos en dos franjas horarias.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[
            { label:'Mañana', slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30'] },
            { label:'Tarde',  slots:['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30'] },
          ].map(franja => (
            <div key={franja.label}>
              <Label>{franja.label}</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                {franja.slots.map(h => (
                  <span key={h} style={{ background:'rgba(232,25,44,0.08)', color:'#E8192C',
                    border:'1px solid rgba(232,25,44,0.2)', padding:'2px 8px', borderRadius:'2px',
                    fontSize:'0.7rem', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.05em' }}>{h}</span>
                ))}
              </div>
            </div>
          ))}
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
