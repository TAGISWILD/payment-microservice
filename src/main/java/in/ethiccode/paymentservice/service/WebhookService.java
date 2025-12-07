package in.ethiccode.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.ethiccode.paymentservice.entity.WebhookEvent;
import in.ethiccode.paymentservice.repository.WebhookEventRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Map;
@Service
public class WebhookService {

    private final WebhookEventRepository webhookEventRepository;
    private final WebhookProcessorService webhookProcessorService;
    private final ObjectMapper objectMapper;

    public WebhookService(WebhookEventRepository webhookEventRepository,
                          WebhookProcessorService webhookProcessorService,
                          ObjectMapper objectMapper) {
        this.webhookEventRepository = webhookEventRepository;
        this.webhookProcessorService = webhookProcessorService;
        this.objectMapper = objectMapper;
    }

    private String headerIgnoreCase(Map<String, String> headers, String name) {
        return headers.entrySet().stream()
                .filter(e -> e.getKey().equalsIgnoreCase(name))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }

    public void handleIncomingWebhook(Map<String, String> headers, String rawBody) {

        String gateway = headerIgnoreCase(headers, "X-Gateway");
        if (gateway == null) gateway = "DUMMY";

        String eventType = headerIgnoreCase(headers, "X-Event-Type");
        if (eventType == null) eventType = "UNKNOWN";

        WebhookEvent event = new WebhookEvent();
        event.setGateway(gateway.toUpperCase(Locale.ROOT));
        event.setEventType(eventType);
        event.setHeaders(headers);
        event.setStatus("RECEIVED");
        event.setReceivedAt(OffsetDateTime.now());

        try {
            Map<String, Object> payloadMap =
                    objectMapper.readValue(rawBody, new TypeReference<Map<String, Object>>() {});
            event.setPayload(payloadMap);
        } catch (JsonProcessingException e) {
            event.setPayload(Map.of("rawBody", rawBody));
            event.setStatus("FAILED");
            event.setErrorMessage("Invalid JSON: " + e.getMessage());
            event.setProcessedAt(OffsetDateTime.now());
        }

        // save first
        event = webhookEventRepository.save(event);

        // 🔥 now call the processor
        webhookProcessorService.process(event);
    }
}
