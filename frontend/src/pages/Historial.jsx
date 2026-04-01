import { useState, useEffect } from 'react'
import { turnosAPI } from '../utils/api'
import { format } from 'date-fns'
import { Search } from 'lucide-react'

const BADGE = { PENDIENTE:'badge-pendiente', CONFIRMADO:'badge-confirmado', CANCELADO:'badge-cancelado', COMPLETADO:'badge-completado' }
const LABEL = { PENDIENTE:'Pendiente', CONFIRMADO:'Confirmado', CANCELADO:'Cancelado', COMPLETADO:'Completado' }
const ESTADOS = ['TODOS','PENDIENTE','CONFIRMADO','COMPLETADO','CANCELADO']

export default function Historial() {
  const [todos,   setTodos]   = useState([])
  const [filtros, setFiltros] = useState([])
  const [busq,    setBusq]    = useState('')
  const [estado,  setEstado]  = useState('TODOS')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    turnosAPI.getTodos().then(res=>{
      const ord=res.data.sort((a,b)=>new Date(b.fechaHora)-new Date(a.fechaHora))
      setTodos(ord); setFiltros(ord)
    }).catch(console.error).finally(()=>setLoading(false))
  },[])

  useEffect(()=>{
    let r=[...todos]
    if(estado!=='TODOS') r=r.filter(t=>t.estado===estado)
    if(busq.trim()){ const q=busq.toLowerCase()
      r=r.filter(t=>t.clienteNombre.toLowerCase().includes(q)||t.clienteTelefono.includes(q)||(t.servicio&&t.servicio.toLowerCase().includes(q))) }
    setFiltros(r)
  },[busq,estado,todos])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }} className="animate-fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'#F8F8F8', letterSpacing:'0.05em' }}>
          HISTORIAL
        </h2>
      </div>

      {/* Buscador */}
      <div style={{ position:'relative' }}>
        <Search size={14} style={{ color:'#444', position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
        <input className="input-field" style={{ paddingLeft:'2.2rem' }}
          placeholder="Buscar por nombre, teléfono o servicio..."
          value={busq} onChange={e=>setBusq(e.target.value)} />
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {ESTADOS.map(e=>(
          <button key={e} onClick={()=>setEstado(e)}
            style={{
              padding:'5px 14px', borderRadius:'2px', cursor:'pointer', transition:'all 0.2s',
              fontFamily:"'Oswald',sans-serif", fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase',
              background: estado===e ? '#E8192C' : '#0d0d0d',
              border: estado===e ? '1px solid #E8192C' : '1px solid #222',
              color: estado===e ? '#F8F8F8' : '#555',
              boxShadow: estado===e ? '0 0 12px rgba(232,25,44,0.3)' : 'none'
            }}>
            {e==='TODOS'?'TODOS':LABEL[e].toUpperCase()}
          </button>
        ))}
      </div>

      <p style={{ color:'#444', fontSize:'0.72rem', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em' }}>
        {filtros.length} REGISTRO{filtros.length!==1?'S':''}
      </p>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'#333' }}>Cargando...</div>
      ) : filtros.length===0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'#333', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em' }}>SIN RESULTADOS</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          {filtros.map((t,i)=>(
            <div key={t.id} className="card-red animate-slide-in"
              style={{ animationDelay:`${i*0.03}s`, display:'flex', flexWrap:'wrap', alignItems:'center', gap:'12px' }}>
              <div style={{ minWidth:'100px', fontFamily:"'Oswald',sans-serif",
                fontSize:'0.8rem', color:'#E8192C', letterSpacing:'0.05em' }}>
                {format(new Date(t.fechaHora),'dd/MM/yy HH:mm')}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', marginBottom:'2px' }}>
                  <span style={{ color:'#F8F8F8', fontFamily:"'Oswald',sans-serif", fontSize:'0.9rem' }}>{t.clienteNombre}</span>
                  <span className={BADGE[t.estado]}>{LABEL[t.estado]}</span>
                </div>
                <div style={{ color:'#444', fontSize:'0.72rem', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <span>📱 {t.clienteTelefono}</span><span>✂️ {t.servicio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
