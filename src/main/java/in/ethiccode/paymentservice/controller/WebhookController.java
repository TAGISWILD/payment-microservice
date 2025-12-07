package in.ethiccode.paymentservice.controller;

import in.ethiccode.paymentservice.service.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader Map<String, String> headers,
            @RequestBody String body) {

        webhookService.handleIncomingWebhook(headers, body);
        // For gateways: just returning 200 OK is usually enough
        return ResponseEntity.ok("ok");
    }
}
