import { useState, useEffect } from 'react'
import { turnosAPI } from '../utils/api'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User, Scissors, TrendingUp, AlertCircle } from 'lucide-react'
import BotonesAccion from '../components/BotonesAccion'

const BADGE = { PENDIENTE:'badge-pendiente', CONFIRMADO:'badge-confirmado', CANCELADO:'badge-cancelado', COMPLETADO:'badge-completado' }
const LABEL = { PENDIENTE:'Pendiente', CONFIRMADO:'Confirmado', CANCELADO:'Cancelado', COMPLETADO:'Completado' }

function GraficoSemanal({ datos }) {
  const max = Math.max(...datos.map(d => d.total), 1)
  return (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
        <TrendingUp size={14} style={{ color:'#E8192C' }} />
        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.8rem',
          letterSpacing:'0.1em', textTransform:'uppercase', color:'#888' }}>
          Actividad Semanal
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'80px' }}>
        {datos.map((d, i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <span style={{ color:'#888', fontSize:'0.65rem', fontFamily:"'Oswald',sans-serif" }}>
              {d.total || ''}
            </span>
            <div style={{
              width:'100%', borderRadius:'1px',
              height: `${Math.max((d.total/max)*60, d.total>0?6:2)}px`,
              background: d.esHoy
                ? 'linear-gradient(180deg,#E8192C,#7a0d16)'
                : d.total > 0 ? '#1E6FD9' : '#1a1a1a',
              boxShadow: d.esHoy ? '0 0 12px rgba(232,25,44,0.5)' : d.total>0 ? '0 0 8px rgba(30,111,217,0.3)' : 'none',
              transition:'all 0.3s', minHeight:'2px'
            }} />
            <span style={{
              fontSize:'0.62rem', fontFamily:"'Oswald',sans-serif", textTransform:'uppercase',
              color: d.esHoy ? '#E8192C' : '#555', fontWeight: d.esHoy ? 700 : 400
            }}>{d.dia}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ onPendientesChange }) {
  const [turnos,  setTurnos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState({ total:0, confirmados:0, pendientes:0, completados:0, cancelados:0 })
  const [grafico, setGrafico] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [config,  setConfig]  = useState({ barbershopName:'BARBERAPP' })

  const cargarTurnos = async () => {
    try {
      const res  = await turnosAPI.getTodos()
      const hoy  = new Date(); hoy.setHours(0,0,0,0)
      const data = res.data.filter(t => new Date(t.fechaHora) >= hoy)

      const activos    = data.filter(t => t.estado !== 'CANCELADO').sort((a,b) => new Date(a.fechaHora)-new Date(b.fechaHora))
      const cancelados = data.filter(t => t.estado === 'CANCELADO').sort((a,b) => new Date(a.fechaHora)-new Date(b.fechaHora))
      setTurnos([...activos, ...cancelados])

      const pend = activos.filter(t => t.estado==='PENDIENTE').length
      setStats({
        total:      activos.length,
        pendientes: pend,
        confirmados: activos.filter(t=>t.estado==='CONFIRMADO').length,
        completados: activos.filter(t=>t.estado==='COMPLETADO').length,
        cancelados:  cancelados.length,
      })
      onPendientesChange?.(pend)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const cargarGrafico = async () => {
    const hoy    = new Date()
    const inicio = startOfWeek(hoy, { weekStartsOn:1 })
    const dias   = Array.from({length:7},(_,i)=>addDays(inicio,i))
    const res    = await Promise.all(dias.map(async dia => {
      try {
        const iso = dia.toISOString().split('T')[0]+'T00:00:00'
        const r   = await turnosAPI.getDia(iso)
        return { dia:format(dia,'EEE',{locale:es}), total:r.data.filter(t=>t.estado!=='CANCELADO').length,
                 esHoy: format(dia,'yyyy-MM-dd')===format(hoy,'yyyy-MM-dd') }
      } catch { return { dia:format(dia,'EEE',{locale:es}), total:0, esHoy:false } }
    }))
    setGrafico(res)
  }

  useEffect(() => {
    cargarTurnos(); cargarGrafico()
    try { const c=localStorage.getItem('barbershop_config'); if(c) setConfig(JSON.parse(c)) } catch {}
    const iv = setInterval(() => { cargarTurnos(); cargarGrafico() }, 30000)
    return () => clearInterval(iv)
  }, [])

  const mostrarMsg = (tipo, texto) => { setMensaje({tipo,texto}); setTimeout(()=>setMensaje(null),3000) }
  const accion = async (fn, id, txt) => {
    try { await fn(id); mostrarMsg('ok',txt); await cargarTurnos() }
    catch(e){ mostrarMsg('error', e.response?.data?.error||e.message) }
  }

  const fechaHoy = format(new Date(),"EEEE d 'de' MMMM yyyy",{locale:es})

  // Separar activos y cancelados para renderizado
  const turnosActivos    = turnos.filter(t => t.estado !== 'CANCELADO')
  const turnosCancelados = turnos.filter(t => t.estado === 'CANCELADO')

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }} className="animate-fade-up">

      {/* Notificación */}
      {mensaje && (
        <div style={{
          position:'fixed', top:'72px', right:'16px', zIndex:100,
          padding:'12px 20px', borderRadius:'2px', fontSize:'0.85rem',
          fontFamily:"'Barlow',sans-serif",
          background: mensaje.tipo==='ok' ? 'rgba(30,111,217,0.15)' : 'rgba(232,25,44,0.15)',
          border: `1px solid ${mensaje.tipo==='ok'?'rgba(30,111,217,0.4)':'rgba(232,25,44,0.4)'}`,
          color: mensaje.tipo==='ok' ? '#4d9fff' : '#ff4d5e',
          boxShadow: mensaje.tipo==='ok' ? '0 0 16px rgba(30,111,217,0.2)' : '0 0 16px rgba(232,25,44,0.2)',
        }}>
          {mensaje.tipo==='ok' ? '✓' : '✕'} {mensaje.texto}
        </div>
      )}

      {/* Banner */}
      <div style={{
        background:'linear-gradient(135deg, #111 0%, #0d0d0d 100%)',
        border:'1px solid #1a1a1a', borderLeft:'4px solid #E8192C',
        borderRadius:'2px', padding:'1.5rem',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div>
          <p style={{ color:'#555', fontSize:'0.72rem', fontFamily:"'Oswald',sans-serif",
            letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'6px' }}>
            {fechaHoy}
          </p>
          <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.8rem',
            color:'#F8F8F8', letterSpacing:'0.05em', lineHeight:1, marginBottom:'6px' }}>
            {(config.barbershopName||'BARBERAPP').toUpperCase()}
          </h1>
          {stats.pendientes > 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <AlertCircle size={13} style={{ color:'#E8192C' }} />
              <span style={{ color:'#E8192C', fontSize:'0.8rem', fontFamily:"'Oswald',sans-serif" }}>
                {stats.pendientes} turno{stats.pendientes>1?'s':''} pendiente{stats.pendientes>1?'s':''} de confirmar
              </span>
            </div>
          ) : (
            <span style={{ color:'#1E6FD9', fontSize:'0.8rem', fontFamily:"'Oswald',sans-serif" }}>
              ✓ Todo al día
            </span>
          )}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'6rem',
          color:'#1a1a1a', lineHeight:1, userSelect:'none' }}>
          ✂
        </div>
      </div>

      {/* Stats — 5 tarjetas */}
      <div style={{ display:'grid', gap:'8px', gridTemplateColumns:'repeat(3,1fr)' }}
        className="md:grid-cols-5">
        {[
          { label:'HOY',        value:stats.total,       accent:'#F8F8F8', glow:'rgba(248,248,248,0.1)' },
          { label:'PENDIENTES', value:stats.pendientes,  accent:'#E8192C', glow:'rgba(232,25,44,0.15)'  },
          { label:'CONFIRMADOS',value:stats.confirmados, accent:'#1E6FD9', glow:'rgba(30,111,217,0.15)' },
          { label:'COMPLETADOS',value:stats.completados, accent:'#22c55e', glow:'rgba(34,197,94,0.15)'  },
          { label:'CANCELADOS', value:stats.cancelados,  accent:'#475569', glow:'none'                  },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor:'#111', border:'1px solid #1e1e1e',
            borderTop:`2px solid ${s.accent}`, borderRadius:'2px',
            padding:'0.875rem', textAlign:'center',
            boxShadow: stats.pendientes>0&&s.label==='PENDIENTES' ? `0 0 20px ${s.glow}` : 'none'
          }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem',
              color:s.accent, lineHeight:1, letterSpacing:'0.02em' }}>{s.value}</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.58rem',
              color:'#555', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      {grafico.length>0 && <GraficoSemanal datos={grafico} />}

      {/* Lista turnos activos */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <div style={{ height:'20px', width:'3px', backgroundColor:'#E8192C', borderRadius:'1px' }} />
          <h2 style={{ fontFamily:"'Oswald',sans-serif", fontSize:'1rem',
            letterSpacing:'0.12em', textTransform:'uppercase', color:'#888' }}>
            Turnos Próximos
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#555' }}>Cargando...</div>
        ) : turnosActivos.length===0 && turnosCancelados.length===0 ? (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            <Scissors size={36} style={{ color:'#222', margin:'0 auto 12px' }} />
            <p style={{ color:'#555', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em' }}>
              SIN TURNOS HOY
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>

            {/* Turnos activos */}
            {turnosActivos.map((turno, i) => (
              <div key={turno.id} className="card-red animate-slide-in"
                style={{ animationDelay:`${i*0.05}s`, display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ minWidth:'56px', fontFamily:"'Bebas Neue',cursive",
                  fontSize:'1.4rem', color:'#E8192C', letterSpacing:'0.05em', lineHeight:1 }}>
                  {format(new Date(turno.fechaHora),'HH:mm')}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'4px' }}>
                    <span style={{ color:'#F8F8F8', fontFamily:"'Oswald',sans-serif",
                      fontWeight:500, fontSize:'0.95rem' }}>{turno.clienteNombre}</span>
                    <span className={BADGE[turno.estado]}>{LABEL[turno.estado]}</span>
                  </div>
                  <div style={{ display:'flex', gap:'12px', flexWrap:'wrap',
                    color:'#555', fontSize:'0.78rem', fontFamily:"'Barlow',sans-serif" }}>
                    <span>📱 {turno.clienteTelefono}</span>
                    <span>✂️ {turno.servicio}</span>
                    {turno.notas&&<span>📝 {turno.notas}</span>}
                  </div>
                </div>
                <BotonesAccion turno={turno} onAccion={accion} />
              </div>
            ))}

            {/* Sección cancelados */}
            {turnosCancelados.length > 0 && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'8px' }}>
                  <div style={{ flex:1, height:'1px', background:'#1a1a1a' }} />
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.65rem',
                    letterSpacing:'0.15em', textTransform:'uppercase', color:'#333',
                    whiteSpace:'nowrap' }}>
                    Cancelados ({turnosCancelados.length})
                  </span>
                  <div style={{ flex:1, height:'1px', background:'#1a1a1a' }} />
                </div>

                {turnosCancelados.map((turno, i) => (
                  <div key={turno.id} className="animate-slide-in"
                    style={{
                      animationDelay:`${i*0.05}s`,
                      display:'flex', flexDirection:'column', gap:'8px',
                      background:'#0c0c0c',
                      border:'1px solid #161616',
                      borderLeft:'3px solid #1e293b',
                      borderRadius:'2px', padding:'1rem',
                      opacity: 0.6,
                    }}>
                    <div style={{ minWidth:'56px', fontFamily:"'Bebas Neue',cursive",
                      fontSize:'1.4rem', color:'#334155', letterSpacing:'0.05em', lineHeight:1 }}>
                      {format(new Date(turno.fechaHora),'HH:mm')}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'4px' }}>
                        <span style={{ color:'#475569', fontFamily:"'Oswald',sans-serif",
                          fontWeight:500, fontSize:'0.95rem',
                          textDecoration:'line-through' }}>{turno.clienteNombre}</span>
                        <span className={BADGE[turno.estado]}>{LABEL[turno.estado]}</span>
                      </div>
                      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap',
                        color:'#334155', fontSize:'0.78rem', fontFamily:"'Barlow',sans-serif" }}>
                        <span>📱 {turno.clienteTelefono}</span>
                        <span>✂️ {turno.servicio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
