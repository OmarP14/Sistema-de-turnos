package com.barbershop.service;

import com.barbershop.model.Turno;
import com.barbershop.repository.TurnoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurnoService {

    private static final Logger log = LoggerFactory.getLogger(TurnoService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final TurnoRepository turnoRepository;
    private final WhatsAppService whatsAppService;

    @Value("${barbershop.owner.phone}")
    private String telefonoPeluquero;

    public TurnoService(TurnoRepository turnoRepository, WhatsAppService whatsAppService) {
        this.turnoRepository = turnoRepository;
        this.whatsAppService = whatsAppService;
    }

    public Turno crearTurno(Turno turno) {
        long conflictos = turnoRepository.countByFechaHoraAndEstadoNotCancelled(turno.getFechaHora());
        if (conflictos > 0) throw new RuntimeException("El horario " + turno.getFechaHora().format(FORMATTER) + " ya está ocupado");
        turno.setEstado(Turno.EstadoTurno.PENDIENTE);
        turno.setCreadoEn(LocalDateTime.now());
        Turno guardado = turnoRepository.save(turno);
        whatsAppService.notificarPeluqueroConOpciones(telefonoPeluquero, guardado.getId(),
            guardado.getClienteNombre(), guardado.getClienteTelefono(),
            guardado.getFechaHora().format(FORMATTER), guardado.getServicio());
        log.info("Turno #{} creado para {}", guardado.getId(), guardado.getClienteNombre());
        return guardado;
    }

    public Turno confirmarTurno(Long id) {
        Turno turno = obtenerTurnoPorId(id);
        turno.setEstado(Turno.EstadoTurno.CONFIRMADO);
        Turno guardado = turnoRepository.save(turno);
        whatsAppService.enviarConfirmacionTurno(guardado.getClienteTelefono(),
            guardado.getClienteNombre(), guardado.getFechaHora().format(FORMATTER), guardado.getServicio());
        return guardado;
    }

    public Turno cancelarTurno(Long id) {
        Turno turno = obtenerTurnoPorId(id);
        turno.setEstado(Turno.EstadoTurno.CANCELADO);
        Turno guardado = turnoRepository.save(turno);
        whatsAppService.enviarCancelacion(guardado.getClienteTelefono(),
            guardado.getClienteNombre(), guardado.getFechaHora().format(FORMATTER));
        return guardado;
    }

    public Turno completarTurno(Long id) {
        Turno turno = obtenerTurnoPorId(id);
        turno.setEstado(Turno.EstadoTurno.COMPLETADO);
        return turnoRepository.save(turno);
    }

    public List<Turno> getTurnosDelDia(LocalDateTime fecha) {
        LocalDateTime inicio = fecha.toLocalDate().atStartOfDay();
        LocalDateTime fin    = fecha.toLocalDate().atTime(23, 59, 59);
        return turnoRepository.findByFechaHoraBetweenOrderByFechaHoraAsc(inicio, fin);
    }

    public List<Turno> getTodosTurnos() {
        return turnoRepository.findAll();
    }

    public Turno obtenerTurnoPorId(Long id) {
        return turnoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));
    }

    public List<Turno> getHorariosOcupados(LocalDateTime fecha) {
        return turnoRepository.findHorariosOcupadosPorDia(fecha);
    }

    // Búsqueda por nombre, teléfono o servicio
    public List<Turno> buscar(String q) {
        String query = q.toLowerCase();
        return turnoRepository.findAll().stream()
            .filter(t ->
                t.getClienteNombre().toLowerCase().contains(query) ||
                t.getClienteTelefono().contains(query) ||
                (t.getServicio() != null && t.getServicio().toLowerCase().contains(query))
            )
            .sorted((a, b) -> b.getFechaHora().compareTo(a.getFechaHora()))
            .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 900000)
    public void enviarRecordatoriosAutomaticos() {
        LocalDateTime ahora   = LocalDateTime.now();
        LocalDateTime en70min = ahora.plusMinutes(70);
        LocalDateTime en50min = ahora.plusMinutes(50);
        List<Turno> turnos = turnoRepository.findTurnosParaRecordatorio(en50min, en70min);
        for (Turno turno : turnos) {
            try {
                whatsAppService.enviarRecordatorio(turno.getClienteTelefono(),
                    turno.getClienteNombre(), turno.getFechaHora().format(FORMATTER));
                turno.setRecordatorioEnviado(true);
                turnoRepository.save(turno);
                log.info("Recordatorio enviado a {}", turno.getClienteNombre());
            } catch (Exception e) {
                log.error("Error recordatorio: {}", e.getMessage());
            }
        }
    }
}
