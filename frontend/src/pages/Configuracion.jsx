import { useState, useEffect } from 'react'
import { Save, CheckCircle } from 'lucide-react'

const SERVICIOS_DEFAULT=['Corte de pelo','Barba','Corte + Barba','Degradé','Coloración']

const Label=({children})=>(
  <label style={{ display:'block', fontFamily:"'Oswald',sans-serif", fontSize:'0.7rem',
    letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', marginBottom:'8px' }}>
    {children}
  </label>
)
const Section=({title,children})=>(
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

  useEffect(()=>{
    try{ const c=localStorage.getItem('barbershop_config'); if(c) setConfig(p=>({...p,...JSON.parse(c),nuevoServicio:''})) }catch{}
  },[])

  const set=(k,v)=>setConfig(f=>({...f,[k]:v}))
  const setH=(k,v)=>setConfig(f=>({...f,horarios:{...f.horarios,[k]:v}}))
  const addSvc=()=>{ if(!config.nuevoServicio.trim())return; set('servicios',[...config.servicios,config.nuevoServicio.trim()]); set('nuevoServicio','') }
  const delSvc=(i)=>set('servicios',config.servicios.filter((_,j)=>j!==i))

  const slots=(()=>{
    const [hI,mI]=config.horarios.inicio.split(':').map(Number)
    const [hF,mF]=config.horarios.fin.split(':').map(Number)
    const dur=parseInt(config.horarios.duracion), ini=hI*60+mI, fin=hF*60+mF, r=[]
    for(let t=ini;t<fin;t+=dur){ r.push(`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`) }
    return r
  })()

  const guardar=()=>{
    const{nuevoServicio,...d}=config; localStorage.setItem('barbershop_config',JSON.stringify(d))
    setGuardado(true); setTimeout(()=>setGuardado(false),2500)
  }

  return (
    <div style={{ maxWidth:'600px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1rem', paddingBottom:'90px' }} className="animate-fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
        <div style={{ height:'24px', width:'3px', backgroundColor:'#E8192C' }} />
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'#F8F8F8', letterSpacing:'0.05em' }}>CONFIGURACIÓN</h2>
      </div>

      <Section title="Datos de la Barbería">
        <div><Label>Nombre</Label>
          <input className="input-field" placeholder="Ej: Barbería El Maestro"
            value={config.barbershopName} onChange={e=>set('barbershopName',e.target.value)} /></div>
        <div><Label>Teléfono del peluquero (WhatsApp)</Label>
          <input className="input-field" placeholder="5492644123456"
            value={config.ownerPhone} onChange={e=>set('ownerPhone',e.target.value)} /></div>
      </Section>

      <Section title="Horario de Atención">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          <div><Label>Apertura</Label>
            <input type="time" className="input-field" value={config.horarios.inicio} onChange={e=>setH('inicio',e.target.value)} /></div>
          <div><Label>Cierre</Label>
            <input type="time" className="input-field" value={config.horarios.fin} onChange={e=>setH('fin',e.target.value)} /></div>
          <div><Label>Duración</Label>
            <select className="input-field" value={config.horarios.duracion} onChange={e=>setH('duracion',e.target.value)}>
              {[15,20,30,45,60].map(m=><option key={m} value={m}>{m} min</option>)}</select></div>
        </div>
        <div>
          <Label>Vista previa de horarios</Label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
            {slots.map(h=>(
              <span key={h} style={{ background:'rgba(232,25,44,0.08)', color:'#E8192C',
                border:'1px solid rgba(232,25,44,0.2)', padding:'2px 8px', borderRadius:'2px',
                fontSize:'0.7rem', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.05em' }}>{h}</span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Servicios">
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {config.servicios.map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px',
              background:'rgba(30,111,217,0.08)', border:'1px solid rgba(30,111,217,0.2)', borderRadius:'2px' }}>
              <span style={{ color:'#F8F8F8', fontSize:'0.82rem' }}>{s}</span>
              <button onClick={()=>delSvc(i)} style={{ color:'#E8192C', background:'none',
                border:'none', cursor:'pointer', fontSize:'0.7rem', lineHeight:1 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input className="input-field" placeholder="Nuevo servicio..."
            value={config.nuevoServicio} onChange={e=>set('nuevoServicio',e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addSvc()} />
          <button onClick={addSvc} className="btn-primary" style={{ whiteSpace:'nowrap' }}>+ AGREGAR</button>
        </div>
      </Section>

      <button onClick={guardar} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
        {guardado ? <><CheckCircle size={15}/> GUARDADO</> : <><Save size={15}/> GUARDAR CONFIGURACIÓN</>}
      </button>

      <p style={{ color:'#94a3b8', fontSize:'0.78rem', textAlign:'center', fontFamily:"'Barlow',sans-serif", background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'4px', padding:'10px 14px' }}>
        ⚠ Los cambios de WhatsApp también requieren actualizar application.properties
      </p>
    </div>
  )
}
