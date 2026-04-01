import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Scissors, Calendar, PlusCircle, LayoutDashboard, History, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { turnosAPI } from './utils/api'
import Dashboard     from './pages/Dashboard'
import NuevoTurno    from './pages/NuevoTurno'
import Agenda        from './pages/Agenda'
import Historial     from './pages/Historial'
import Configuracion from './pages/Configuracion'
import Reservar      from './pages/Reservar'

const navItems = [
  { to:'/',          icon:LayoutDashboard, label:'Dashboard', end:true },
  { to:'/agenda',    icon:Calendar,        label:'Agenda'             },
  { to:'/nuevo',     icon:PlusCircle,      label:'Nuevo'              },
  { to:'/historial', icon:History,         label:'Historial'          },
  { to:'/config',    icon:Settings,        label:'Config'             },
]

export default function App() {
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await turnosAPI.getHoy()
        setPendientes(res.data.filter(t => t.estado === 'PENDIENTE').length)
      } catch {}
    }
    cargar()
    const iv = setInterval(cargar, 60000)
    return () => clearInterval(iv)
  }, [])

  // Ruta pública del cliente — sin header ni nav del admin
  if (window.location.pathname === '/reservar') {
    return <BrowserRouter><Routes><Route path="/reservar" element={<Reservar />} /></Routes></BrowserRouter>
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* ── HEADER ── */}
        <header style={{
          background: 'rgba(8,16,32,0.9)',
          borderBottom: '1px solid rgba(59,130,246,0.2)',
          backdropFilter: 'blur(16px)',
          position: 'sticky', top:0, zIndex:50,
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          {/* Línea superior degradada rojo → azul */}
          <div style={{ height:'3px', background:'linear-gradient(90deg,#E8192C 0%,#3b82f6 50%,#0d2347 100%)' }} />

          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 1rem',
            display:'flex', alignItems:'center', justifyContent:'space-between', height:'58px' }}>

            {/* Logo BarberApp */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{
                width:'38px', height:'38px',
                background:'linear-gradient(135deg,#E8192C,#b91c2c)',
                borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 16px rgba(232,25,44,0.5)',
                animation:'glowRed 3s ease infinite'
              }}>
                <Scissors size={19} style={{ color:'#fff' }} />
              </div>
              <div>
                <div style={{
                  fontFamily:"'Bebas Neue',cursive", fontSize:'1.5rem',
                  letterSpacing:'0.1em', lineHeight:1,
                  background:'linear-gradient(90deg,#F8F8F8,#93c5fd)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
                }}>
                  BARBER<span style={{ WebkitTextFillColor:'#E8192C' }}>APP</span>
                </div>
                <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:'0.58rem',
                  color:'#475569', letterSpacing:'0.2em', textTransform:'uppercase' }}>
                  Sistema de Turnos
                </div>
              </div>
            </div>

            {/* Nav escritorio */}
            <nav style={{ display:'flex', gap:'2px' }} className="hidden md:flex">
              {navItems.map(({ to, icon:Icon, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:'5px',
                    padding:'6px 14px', fontSize:'0.75rem',
                    fontFamily:"'Oswald',sans-serif", fontWeight:500,
                    letterSpacing:'0.08em', textTransform:'uppercase',
                    transition:'all 0.2s', borderRadius:'4px', position:'relative',
                    background: isActive ? 'rgba(232,25,44,0.15)' : 'transparent',
                    color: isActive ? '#fb7185' : '#64748b',
                    border: isActive ? '1px solid rgba(232,25,44,0.3)' : '1px solid transparent',
                  })}>
                  <Icon size={14} /> {label}
                  {label === 'Dashboard' && pendientes > 0 && (
                    <span style={{
                      position:'absolute', top:'-5px', right:'-5px',
                      background:'#E8192C', color:'#fff', fontSize:'0.55rem', fontWeight:700,
                      width:'16px', height:'16px', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 0 8px rgba(232,25,44,0.8)'
                    }}>{pendientes}</span>
                  )}
                </NavLink>
              ))}
            </nav>

          </div>
        </header>

        {/* ── CONTENIDO ── */}
        <main style={{ flex:1, maxWidth:'1200px', margin:'0 auto', width:'100%', padding:'1.5rem 1rem' }}>
          <Routes>
            <Route path="/"          element={<Dashboard onPendientesChange={setPendientes} />} />
            <Route path="/agenda"    element={<Agenda />}        />
            <Route path="/nuevo"     element={<NuevoTurno />}    />
            <Route path="/historial" element={<Historial />}     />
            <Route path="/config"    element={<Configuracion />} />
          </Routes>
        </main>

        {/* ── NAV MÓVIL ── */}
        <nav style={{
          background:'rgba(8,16,32,0.95)',
          borderTop:'1px solid rgba(59,130,246,0.2)',
          backdropFilter:'blur(16px)',
          position:'fixed', bottom:0, left:0, right:0, zIndex:50,
          display:'flex', justifyContent:'space-around', padding:'8px 0'
        }} className="md:hidden">
          {navItems.map(({ to, icon:Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              style={({ isActive }) => ({
                display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                padding:'4px 10px', fontSize:'0.58rem',
                fontFamily:"'Oswald',sans-serif", letterSpacing:'0.05em', textTransform:'uppercase',
                color: isActive ? '#fb7185' : '#475569', transition:'color 0.2s',
                position:'relative', textDecoration:'none'
              })}>
              <Icon size={20} />
              {label}
              {label === 'Dashboard' && pendientes > 0 && (
                <span style={{
                  position:'absolute', top:0, right:'4px',
                  background:'#E8192C', color:'#fff', fontSize:'0.5rem', fontWeight:700,
                  width:'13px', height:'13px', borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>{pendientes}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden" style={{ height:'64px' }} />
      </div>
    </BrowserRouter>
  )
}
