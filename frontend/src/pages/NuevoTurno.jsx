import { useState } from 'react'
import { turnosAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader, Scissors } from 'lucide-react'

const SERVICIOS = [
  { value:'Corte de pelo',  icon:'✂️' },
  { value:'Barba',          icon:'🪒' },
  { value:'Corte + Barba',  icon:'💈' },
  { value:'Degradé',        icon:'⚡' },
  { value:'Coloración',     icon:'🎨' },
]

const HORARIOS = Array.from({length:21},(_,i)=>{
  const t=9*60+i*30; if(t>=19*60)return null
  return `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`
}).filter(Boolean)

const Label = ({children}) => (
  <label style={{ display:'block', fontFamily:"'Oswald',sans-serif", fontSize:'0.72rem',
    letterSpacing:'0.12em', textTransform:'uppercase', color:'#666', marginBottom:'8px' }}>
    {children}
  </label>
)

export default function NuevoTurno() {
  const navigate = useNavigate()
  const [loading,setLoading]=useState(false)
  const [exito,setExito]=useState(false)
  const [error,setError]=useState('')
  const hoy = new Date().toISOString().split('T')[0]
  const [form,setForm]=useState({ clienteNombre:'',clienteTelefono:'',fecha:hoy,hora:'09:00',servicio:'Corte de pelo',notas:'' })
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const handleSubmit = async () => {
    setError('')
    if(!form.clienteNombre||!form.clienteTelefono||!form.fecha||!form.hora){
      setError('Completá todos los campos obligatorios'); return
    }
    try {
      setLoading(true)
      await turnosAPI.crear({ clienteNombre:form.clienteNombre, clienteTelefono:form.clienteTelefono,
        fechaHora:`${form.fecha}T${form.hora}:00`, servicio:form.servicio, notas:form.notas })
      setExito(true); setTimeout(()=>navigate('/'),2000)
    } catch(e){ setError(e.response?.data?.error||'Error al crear el turno') }
    finally{ setLoading(false) }
  }

  if(exito) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'50vh', gap:'16px' }}>
      <div style={{ border:'2px solid #1E6FD9', padding:'24px', borderRadius:'2px',
        boxShadow:'0 0 40px rgba(30,111,217,0.3)' }}>
        <CheckCircle size={56} style={{ color:'#1E6FD9' }} />
      </div>
      <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F8F8' }}>
        TURNO CREADO
      </h2>
      <p style={{ color:'#555', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em', fontSize:'0.8rem' }}>
        EL PELUQUERO FUE NOTIFICADO POR WHATSAPP
      </p>
    </div>
  )

  return (
    <div style={{ maxWidth:'520px', margin:'0 auto', paddingBottom:'90px' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem',
            color:'#F8F8F8', letterSpacing:'0.05em' }}>NUEVO TURNO</h2>
        </div>
        <p style={{ color:'#555', fontSize:'0.78rem', fontFamily:"'Oswald',sans-serif",
          letterSpacing:'0.08em', textTransform:'uppercase' }}>
          El peluquero recibirá notificación por WhatsApp
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

        {/* Nombre */}
        <div>
          <Label>Nombre del cliente *</Label>
          <input className="input-field" placeholder="Juan Pérez"
            value={form.clienteNombre} onChange={e=>set('clienteNombre',e.target.value)} />
        </div>

        {/* Teléfono */}
        <div>
          <Label>Teléfono WhatsApp * <span style={{ color:'#E8192C' }}>ej: 5492644123456</span></Label>
          <input className="input-field" placeholder="5492644123456"
            value={form.clienteTelefono} onChange={e=>set('clienteTelefono',e.target.value)} />
        </div>

        {/* Fecha y hora */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <div>
            <Label>Fecha *</Label>
            <input type="date" className="input-field" min={hoy}
              value={form.fecha} onChange={e=>set('fecha',e.target.value)} />
          </div>
          <div>
            <Label>Hora *</Label>
            <select className="input-field" value={form.hora} onChange={e=>set('hora',e.target.value)}>
              {HORARIOS.map(h=><option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Servicio */}
        <div>
          <Label>Servicio *</Label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
            {SERVICIOS.map(s=>(
              <button key={s.value} onClick={()=>set('servicio',s.value)}
                style={{
                  padding:'10px 14px', borderRadius:'2px', textAlign:'left',
                  border: form.servicio===s.value ? '1px solid #E8192C' : '1px solid #222',
                  background: form.servicio===s.value ? 'rgba(232,25,44,0.08)' : '#0d0d0d',
                  color: form.servicio===s.value ? '#F8F8F8' : '#666',
                  fontFamily:"'Barlow',sans-serif", fontSize:'0.85rem',
                  cursor:'pointer', transition:'all 0.2s',
                  boxShadow: form.servicio===s.value ? '0 0 12px rgba(232,25,44,0.2)' : 'none'
                }}>
                {s.icon} {s.value}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <Label>Notas (opcional)</Label>
          <textarea className="input-field" style={{ resize:'none', height:'72px' }}
            placeholder="Alguna preferencia especial..."
            value={form.notas} onChange={e=>set('notas',e.target.value)} />
        </div>

        {error && (
          <div style={{ background:'rgba(232,25,44,0.08)', border:'1px solid rgba(232,25,44,0.3)',
            color:'#ff4d5e', padding:'10px 14px', borderRadius:'2px', fontSize:'0.82rem',
            fontFamily:"'Barlow',sans-serif" }}>
            ✕ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary"
          style={{ width:'100%', justifyContent:'center', fontSize:'0.9rem' }}>
          {loading ? <><Loader size={15} className="animate-spin"/> CREANDO...</> : '✂ CREAR TURNO'}
        </button>

      </div>
    </div>
  )
}
