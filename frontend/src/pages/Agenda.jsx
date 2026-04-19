import { useState, useEffect } from 'react'
import { turnosAPI } from '../utils/api'
import { format, addDays, subDays, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BotonesAccion from '../components/BotonesAccion'

const BADGE = { PENDIENTE:'badge-pendiente', CONFIRMADO:'badge-confirmado', CANCELADO:'badge-cancelado', COMPLETADO:'badge-completado' }
const LABEL = { PENDIENTE:'Pendiente', CONFIRMADO:'Confirmado', CANCELADO:'Cancelado', COMPLETADO:'Completado' }

export default function Agenda() {
  const [fecha,   setFecha]   = useState(new Date())
  const [turnos,  setTurnos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const hoy      = new Date()
  const inicio   = startOfWeek(fecha,{weekStartsOn:1})
  const dias     = Array.from({length:7},(_,i)=>addDays(inicio,i))

  const cargar = async (f) => {
    setLoading(true)
    try {
      const iso = f.toISOString().split('T')[0]+'T00:00:00'
      const res = await turnosAPI.getDia(iso)
      setTurnos(res.data)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(()=>{ cargar(fecha) },[fecha])

  const mostrarMsg = (tipo,texto) => { setMensaje({tipo,texto}); setTimeout(()=>setMensaje(null),3000) }
  const accion = async (fn,id,txt) => {
    try { await fn(id); mostrarMsg('ok',txt); await cargar(fecha) }
    catch(e){ mostrarMsg('error', e.response?.data?.error||e.message) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }} className="animate-fade-up">

      {/* Notificación */}
      {mensaje && (
        <div style={{
          padding:'10px 18px', borderRadius:'6px', fontSize:'0.82rem',
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
          background: mensaje.tipo==='ok'?'rgba(15,30,60,0.97)':'rgba(30,8,12,0.97)',
          border:`1px solid ${mensaje.tipo==='ok'?'rgba(59,130,246,0.5)':'rgba(232,25,44,0.5)'}`,
          color: mensaje.tipo==='ok'?'#93c5fd':'#fb7185',
          fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em',
          textAlign:'center',
        }}>
          {mensaje.tipo==='ok'?'✓':'✕'} {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem',
            color:'#F8F8F8', letterSpacing:'0.05em' }}>AGENDA</h2>
        </div>
        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
          <button onClick={()=>setFecha(d=>subDays(d,7))}
            style={{ padding:'6px', background:'#111', border:'1px solid #222',
              borderRadius:'2px', color:'#666', cursor:'pointer', display:'flex' }}>
            <ChevronLeft size={16}/>
          </button>
          <button onClick={()=>setFecha(new Date())}
            style={{ padding:'6px 12px', background:'#111', border:'1px solid #E8192C',
              borderRadius:'2px', color:'#E8192C', cursor:'pointer', fontFamily:"'Oswald',sans-serif",
              fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            HOY
          </button>
          <button onClick={()=>setFecha(d=>addDays(d,7))}
            style={{ padding:'6px', background:'#111', border:'1px solid #222',
              borderRadius:'2px', color:'#666', cursor:'pointer', display:'flex' }}>
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
        {dias.map(dia => {
          const esHoy = format(dia,'yyyy-MM-dd')===format(hoy,'yyyy-MM-dd')
          const esSel = format(dia,'yyyy-MM-dd')===format(fecha,'yyyy-MM-dd')
          return (
            <button key={dia.toISOString()} onClick={()=>setFecha(dia)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                padding:'10px 4px', borderRadius:'2px', cursor:'pointer', transition:'all 0.2s',
                border: esSel ? '1px solid #E8192C' : esHoy ? '1px solid #333' : '1px solid transparent',
                background: esSel ? 'rgba(232,25,44,0.1)' : esHoy ? '#111' : 'transparent',
                boxShadow: esSel ? '0 0 12px rgba(232,25,44,0.2)' : 'none',
              }}>
              <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:'0.62rem',
                letterSpacing:'0.1em', textTransform:'uppercase',
                color: esSel?'#E8192C' : esHoy?'#888':'#444' }}>
                {format(dia,'EEE',{locale:es})}
              </span>
              <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.4rem',
                color: esSel?'#F8F8F8' : esHoy?'#F8F8F8':'#555', lineHeight:1.1 }}>
                {format(dia,'d')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Subtítulo */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ color:'#555', fontSize:'0.75rem', fontFamily:"'Oswald',sans-serif",
          letterSpacing:'0.1em', textTransform:'uppercase', textTransform:'capitalize' }}>
          {format(fecha,"EEEE d 'de' MMMM",{locale:es})}
        </p>
        <span style={{ color:'#E8192C', fontSize:'0.75rem', fontFamily:"'Oswald',sans-serif",
          letterSpacing:'0.08em' }}>
          {turnos.length} TURNO{turnos.length!==1?'S':''}
        </span>
      </div>

      {/* Turnos */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'#444' }}>Cargando...</div>
      ) : turnos.length===0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'#333', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em' }}>
            SIN TURNOS ESTE DÍA
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {turnos.map((t,i) => (
            <div key={t.id} className="card-red animate-slide-in"
              style={{ animationDelay:`${i*0.04}s`,
                display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ minWidth:'52px', fontFamily:"'Bebas Neue',cursive",
                fontSize:'1.4rem', color:'#E8192C', lineHeight:1 }}>
                {format(new Date(t.fechaHora),'HH:mm')}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', marginBottom:'3px' }}>
                  <span style={{ color:'#F8F8F8', fontFamily:"'Oswald',sans-serif",
                    fontWeight:500, fontSize:'0.9rem' }}>{t.clienteNombre}</span>
                  <span className={BADGE[t.estado]}>{LABEL[t.estado]}</span>
                </div>
                <div style={{ color:'#444', fontSize:'0.75rem', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <span>📱 {t.clienteTelefono}</span>
                  <span>✂️ {t.servicio}</span>
                </div>
              </div>
              </div>
              <BotonesAccion turno={t} onAccion={accion} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
