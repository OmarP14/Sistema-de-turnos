package com.barbershop.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "turnos")
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank(message = "El nombre del cliente es requerido")
    @Column(name = "cliente_nombre", nullable = false)
    private String clienteNombre;

    @NotBlank(message = "El teléfono es requerido")
    @Column(name = "cliente_telefono", nullable = false)
    private String clienteTelefono;

    @NotNull(message = "La fecha y hora es requerida")
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "servicio")
    private String servicio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoTurno estado = EstadoTurno.PENDIENTE;

    @Column(name = "notas")
    private String notas;

    @Column(name = "recordatorio_enviado")
    private boolean recordatorioEnviado = false;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn = LocalDateTime.now();

    public enum EstadoTurno {
        PENDIENTE, CONFIRMADO, CANCELADO, COMPLETADO
    }

    // ── Getters ──────────────────────────────────────────
    public Long getId()                    { return id; }
    public String getClienteNombre()       { return clienteNombre; }
    public String getClienteTelefono()     { return clienteTelefono; }
    public LocalDateTime getFechaHora()    { return fechaHora; }
    public String getServicio()            { return servicio; }
    public EstadoTurno getEstado()         { return estado; }
    public String getNotas()               { return notas; }
    public boolean isRecordatorioEnviado() { return recordatorioEnviado; }
    public LocalDateTime getCreadoEn()     { return creadoEn; }

    // ── Setters ──────────────────────────────────────────
    public void setId(Long id)                          { this.id = id; }
    public void setClienteNombre(String v)              { this.clienteNombre = v; }
    public void setClienteTelefono(String v)            { this.clienteTelefono = v; }
    public void setFechaHora(LocalDateTime v)           { this.fechaHora = v; }
    public void setServicio(String v)                   { this.servicio = v; }
    public void setEstado(EstadoTurno v)                { this.estado = v; }
    public void setNotas(String v)                      { this.notas = v; }
    public void setRecordatorioEnviado(boolean v)       { this.recordatorioEnviado = v; }
    public void setCreadoEn(LocalDateTime v)            { this.creadoEn = v; }
}
