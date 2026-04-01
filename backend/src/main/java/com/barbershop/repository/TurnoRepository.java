package com.barbershop.repository;

import com.barbershop.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    // Turnos del día actual
    List<Turno> findByFechaHoraBetweenOrderByFechaHoraAsc(
        LocalDateTime inicio, LocalDateTime fin
    );

    // Turnos pendientes por teléfono (para el cliente)
    List<Turno> findByClienteTelefonoAndEstadoIn(
        String telefono, List<Turno.EstadoTurno> estados
    );

    // Turnos que necesitan recordatorio (1 hora antes, aún no enviado)
    @Query("SELECT t FROM Turno t WHERE t.fechaHora BETWEEN :desde AND :hasta " +
           "AND t.recordatorioEnviado = false " +
           "AND t.estado = 'CONFIRMADO'")
    List<Turno> findTurnosParaRecordatorio(
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta
    );

    // Verificar si hay turno en ese horario (para evitar solapamiento)
    @Query("SELECT COUNT(t) FROM Turno t WHERE t.fechaHora = :fechaHora " +
           "AND t.estado NOT IN ('CANCELADO')")
    long countByFechaHoraAndEstadoNotCancelled(@Param("fechaHora") LocalDateTime fechaHora);

    // Horarios ocupados en un día
    @Query("SELECT t FROM Turno t WHERE DATE(t.fechaHora) = DATE(:fecha) " +
           "AND t.estado NOT IN ('CANCELADO') ORDER BY t.fechaHora ASC")
    List<Turno> findHorariosOcupadosPorDia(@Param("fecha") LocalDateTime fecha);
}
