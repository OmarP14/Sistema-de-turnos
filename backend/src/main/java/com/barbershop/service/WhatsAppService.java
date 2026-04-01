package com.barbershop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${whatsapp.api.url}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id}")
    private String phoneNumberId;

    @Value("${whatsapp.access.token}")
    private String accessToken;

    @Value("${barbershop.name}")
    private String barbershopName;

    // 1. NOTIFICAR AL PELUQUERO con opciones SI/NO
    public void notificarPeluqueroConOpciones(String telefonoPeluquero, Long turnoId,
                                               String clienteNombre, String clienteTelefono,
                                               String fechaHora, String servicio) {
        String mensaje = String.format(
            "💈 *Nuevo Turno Reservado - %s*\n\n" +
            "👤 *Cliente:* %s\n" +
            "📱 *Teléfono:* %s\n" +
            "📅 *Fecha/Hora:* %s\n" +
            "✂️ *Servicio:* %s\n\n" +
            "─────────────────\n" +
            "Respondé con:\n" +
            "✅ *SI %d* para confirmar\n" +
            "❌ *NO %d* para cancelar",
            barbershopName, clienteNombre, clienteTelefono,
            fechaHora, servicio, turnoId, turnoId
        );
        enviarMensajeTexto(telefonoPeluquero, mensaje);
    }

    // 2. CONFIRMAR TURNO AL CLIENTE
    public void enviarConfirmacionTurno(String telefono, String nombre,
                                         String fechaHora, String servicio) {
        String mensaje = String.format(
            "✅ *%s - Turno Confirmado*\n\n" +
            "Hola %s! Tu turno está confirmado.\n\n" +
            "📅 *Fecha y hora:* %s\n" +
            "✂️ *Servicio:* %s\n\n" +
            "Si necesitás cancelar, respondé *CANCELAR*.\n" +
            "¡Te esperamos! 💈",
            barbershopName, nombre, fechaHora, servicio
        );
        enviarMensajeTexto(telefono, mensaje);
    }

    // 3. RECORDATORIO 1 HORA ANTES
    public void enviarRecordatorio(String telefono, String nombre, String fechaHora) {
        String mensaje = String.format(
            "⏰ *Recordatorio - %s*\n\n" +
            "Hola %s! En *1 hora* tenés tu turno.\n" +
            "📅 %s\n\n" +
            "Si no podés venir, respondé *CANCELAR*.\n" +
            "¡Te esperamos! 💈",
            barbershopName, nombre, fechaHora
        );
        enviarMensajeTexto(telefono, mensaje);
    }

    // 4. AVISO DE CANCELACIÓN AL CLIENTE
    public void enviarCancelacion(String telefono, String nombre, String fechaHora) {
        String mensaje = String.format(
            "❌ *%s - Turno Cancelado*\n\n" +
            "Hola %s, tu turno del\n" +
            "📅 *%s* fue cancelado.\n\n" +
            "Podés reservar un nuevo turno cuando quieras.\n" +
            "Disculpá los inconvenientes 🙏",
            barbershopName, nombre, fechaHora
        );
        enviarMensajeTexto(telefono, mensaje);
    }

    // PROCESAR MENSAJES ENTRANTES DEL WEBHOOK
    public String procesarMensajeEntrante(String telefono, String mensajeTexto) {
        String texto = mensajeTexto.trim().toUpperCase();
        if (texto.startsWith("SI "))      return "CONFIRMAR:" + texto.replace("SI ", "").trim();
        if (texto.startsWith("NO "))      return "CANCELAR_ID:" + texto.replace("NO ", "").trim();
        if (texto.equals("CANCELAR"))     return "CANCELAR_CLIENTE:" + telefono;
        return "DESCONOCIDO";
    }

    // ENVÍO BASE
    public void enviarMensajeTexto(String telefono, String mensaje) {
        try {
            // Limpiar: solo números
            String tel = telefono.replaceAll("[^0-9]", "");

            // Log para debug — ver qué número se está usando
            log.info("Enviando WhatsApp a número original: {} → limpio: {}", telefono, tel);

            // NO modificar el número — usarlo exactamente como viene
            // El usuario debe ingresar el número en formato internacional (ej: 5492644819470)
            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", tel);
            body.put("type", "text");
            body.put("text", Map.of("body", mensaje));

            String jsonBody = objectMapper.writeValueAsString(body);
            Request request = new Request.Builder()
                .url(apiUrl + "/" + phoneNumberId + "/messages")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(jsonBody, MediaType.get("application/json")))
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("WhatsApp enviado a {}", tel);
                } else {
                    log.error("Error WhatsApp {}: {}", response.code(),
                        response.body() != null ? response.body().string() : "sin cuerpo");
                }
            }
        } catch (IOException e) {
            log.error("Error enviando WhatsApp: {}", e.getMessage());
        }
    }
}
