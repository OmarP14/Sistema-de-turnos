package com.barbershop.controller;

import com.barbershop.model.Turno;
import com.barbershop.service.TurnoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin(origins = "*")
public class TurnoController {

    private final TurnoService turnoService;

    public TurnoController(TurnoService turnoService) {
        this.turnoService = turnoService;
    }

    @GetMapping
    public ResponseEntity<List<Turno>> getTodos() {
        return ResponseEntity.ok(turnoService.getTodosTurnos());
    }

    @GetMapping("/hoy")
    public ResponseEntity<List<Turno>> getTurnosHoy() {
        return ResponseEntity.ok(turnoService.getTurnosDelDia(LocalDateTime.now()));
    }

    @GetMapping("/dia")
    public ResponseEntity<List<Turno>> getTurnosDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fecha) {
        return ResponseEntity.ok(turnoService.getTurnosDelDia(fecha));
    }

    @GetMapping("/ocupados")
    public ResponseEntity<List<Turno>> getHorariosOcupados(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fecha) {
        return ResponseEntity.ok(turnoService.getHorariosOcupados(fecha));
    }

    // BÚSQUEDA por nombre, teléfono o servicio
    @GetMapping("/buscar")
    public ResponseEntity<List<Turno>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(turnoService.buscar(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turno> getTurno(@PathVariable Long id) {
        return ResponseEntity.ok(turnoService.obtenerTurnoPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crearTurno(@Valid @RequestBody Turno turno) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(turnoService.crearTurno(turno));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Turno> confirmarTurno(@PathVariable Long id) {
        return ResponseEntity.ok(turnoService.confirmarTurno(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Turno> cancelarTurno(@PathVariable Long id) {
        return ResponseEntity.ok(turnoService.cancelarTurno(id));
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<Turno> completarTurno(@PathVariable Long id) {
        return ResponseEntity.ok(turnoService.completarTurno(id));
    }
}
