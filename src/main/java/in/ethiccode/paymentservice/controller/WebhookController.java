package in.ethiccode.paymentservice.controller;

import in.ethiccode.paymentservice.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader Map<String, String> headers,
            @RequestBody String body) {

        log.debug("Received webhook request");
        webhookService.handleIncomingWebhook(headers, body);
        // For gateways: just returning 200 OK is usually enough
        return ResponseEntity.ok("ok");
    }
}
