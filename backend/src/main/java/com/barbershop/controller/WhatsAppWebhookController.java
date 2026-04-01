package com.barbershop.controller;

import com.barbershop.service.TurnoService;
import com.barbershop.service.WhatsAppService;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class WhatsAppWebhookController {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppWebhookController.class);

    private final WhatsAppService whatsAppService;
    private final TurnoService turnoService;

    @Value("${whatsapp.verify.token}")
    private String verifyToken;

    public WhatsAppWebhookController(WhatsAppService whatsAppService, TurnoService turnoService) {
        this.whatsAppService = whatsAppService;
        this.turnoService = turnoService;
    }

    // GET /webhook - Verificación de Meta
    @GetMapping
    public ResponseEntity<String> verificarWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("Webhook verificado correctamente");
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(403).body("Token inválido");
    }

    // POST /webhook - Mensajes entrantes
    @PostMapping
    public ResponseEntity<String> recibirMensaje(@RequestBody JsonNode payload) {
        try {
            JsonNode messages = payload
                .path("entry").get(0)
                .path("changes").get(0)
                .path("value")
                .path("messages");

            if (messages.isEmpty()) return ResponseEntity.ok("EVENT_RECEIVED");

            JsonNode mensaje = messages.get(0);
            String telefono = mensaje.path("from").asText();
            String texto    = mensaje.path("text").path("body").asText();

            log.info("Mensaje entrante de {}: {}", telefono, texto);

            String accion = whatsAppService.procesarMensajeEntrante(telefono, texto);

            // Peluquero respondió "SI 5" → confirmar turno ID 5
            if (accion.startsWith("CONFIRMAR:")) {
                Long id = Long.parseLong(accion.replace("CONFIRMAR:", ""));
                turnoService.confirmarTurno(id);
                log.info("Turno #{} confirmado via WhatsApp por el peluquero", id);
            }

            // Peluquero respondió "NO 5" → cancelar turno ID 5
            else if (accion.startsWith("CANCELAR_ID:")) {
                Long id = Long.parseLong(accion.replace("CANCELAR_ID:", ""));
                turnoService.cancelarTurno(id);
                log.info("Turno #{} cancelado via WhatsApp por el peluquero", id);
            }

            // Cliente respondió "CANCELAR" → buscar su turno pendiente y cancelarlo
            else if (accion.startsWith("CANCELAR_CLIENTE:")) {
                log.info("Cliente {} solicitó cancelar su turno", telefono);
                // Podés agregar lógica adicional aquí para cancelar por número de cliente
            }

        } catch (NumberFormatException e) {
            log.warn("El peluquero respondió con un ID inválido: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error procesando webhook: {}", e.getMessage());
        }

        return ResponseEntity.ok("EVENT_RECEIVED");
    }
}
