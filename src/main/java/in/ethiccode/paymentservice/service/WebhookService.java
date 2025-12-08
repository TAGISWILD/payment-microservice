package in.ethiccode.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.ethiccode.paymentservice.config.RazorpayProperties;
import in.ethiccode.paymentservice.entity.WebhookEvent;
import in.ethiccode.paymentservice.exception.PaymentException;
import in.ethiccode.paymentservice.repository.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final WebhookEventRepository webhookEventRepository;
    private final WebhookProcessorService webhookProcessorService;
    private final ObjectMapper objectMapper;
    private final RazorpayProperties razorpayProperties;

    /**
     * Case-insensitive header lookup
     */
    private String headerIgnoreCase(Map<String, String> headers, String name) {
        return headers.entrySet().stream()
                .filter(e -> e.getKey().equalsIgnoreCase(name))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }

    /**
     * Main entry point for incoming webhooks
     */
    public void handleIncomingWebhook(Map<String, String> headers, String rawBody) {
        // Detect gateway from headers or default
        String gateway = headerIgnoreCase(headers, "X-Gateway");
        if (gateway == null) {
            // Check if it's a Razorpay webhook by looking for their signature header
            String razorpaySignature = headerIgnoreCase(headers, "X-Razorpay-Signature");
            gateway = (razorpaySignature != null) ? "RAZORPAY" : "DUMMY";
        }

        log.info("Received webhook from gateway: {}", gateway);

        // Verify signature for Razorpay webhooks
        if ("RAZORPAY".equalsIgnoreCase(gateway)) {
            verifyRazorpaySignature(headers, rawBody);
        }

        String eventType = detectEventType(headers, rawBody, gateway);

        WebhookEvent event = new WebhookEvent();
        event.setGateway(gateway.toUpperCase(Locale.ROOT));
        event.setEventType(eventType);
        event.setHeaders(headers);
        event.setStatus("RECEIVED");
        event.setReceivedAt(OffsetDateTime.now());

        try {
            Map<String, Object> payloadMap =
                    objectMapper.readValue(rawBody, new TypeReference<>() {});
            event.setPayload(payloadMap);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse webhook JSON: {}", e.getMessage());
            event.setPayload(Map.of("rawBody", rawBody));
            event.setStatus("FAILED");
            event.setErrorMessage("Invalid JSON: " + e.getMessage());
            event.setProcessedAt(OffsetDateTime.now());
        }

        // Save event first (for audit trail)
        event = webhookEventRepository.save(event);
        log.info("Saved webhook event id={} type={}", event.getId(), eventType);

        // Process the webhook
        webhookProcessorService.process(event);
    }

    /**
     * Verify Razorpay webhook signature using HMAC-SHA256
     */
    private void verifyRazorpaySignature(Map<String, String> headers, String rawBody) {
        String signature = headerIgnoreCase(headers, "X-Razorpay-Signature");

        // If no signature header, skip verification (for testing/dummy mode)
        if (signature == null || signature.isBlank()) {
            log.warn("No X-Razorpay-Signature header found, skipping verification");
            return;
        }

        String webhookSecret = razorpayProperties.getWebhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Webhook secret not configured, skipping signature verification");
            return;
        }

        String expectedSignature = hmacSha256(rawBody, webhookSecret);

        if (!expectedSignature.equals(signature)) {
            log.error("Invalid Razorpay webhook signature! Expected={}, Received={}",
                    expectedSignature.substring(0, 10) + "...",
                    signature.substring(0, Math.min(10, signature.length())) + "...");
            throw new PaymentException(
                    "Invalid webhook signature",
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_WEBHOOK_SIGNATURE"
            );
        }

        log.info("Razorpay webhook signature verified successfully");
    }

    /**
     * Detect event type from headers or payload
     */
    private String detectEventType(Map<String, String> headers, String rawBody, String gateway) {
        // First check custom header
        String eventType = headerIgnoreCase(headers, "X-Event-Type");
        if (eventType != null) {
            return eventType;
        }

        // For Razorpay, try to extract from payload
        if ("RAZORPAY".equalsIgnoreCase(gateway)) {
            try {
                Map<String, Object> payload = objectMapper.readValue(rawBody, new TypeReference<>() {});
                Object event = payload.get("event");
                if (event != null) {
                    return event.toString();
                }
            } catch (JsonProcessingException ignored) {
                // Fall through to default
            }
        }

        return "UNKNOWN";
    }

    /**
     * HMAC-SHA256 signature generation
     */
    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(keySpec);
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(raw.length * 2);
            for (byte b : raw) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }
}
