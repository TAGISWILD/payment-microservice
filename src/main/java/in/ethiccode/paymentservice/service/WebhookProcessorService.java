package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.entity.WebhookEvent;
import in.ethiccode.paymentservice.enums.PaymentStatus;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import in.ethiccode.paymentservice.repository.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookProcessorService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final WebhookEventRepository webhookEventRepository;

    @Transactional
    public void process(WebhookEvent event) {
        try {
            String eventType = event.getEventType();
            log.info("Processing webhook event id={} type={}", event.getId(), eventType);

            // Handle different event types
            if ("payment.captured".equalsIgnoreCase(eventType)) {
                handlePaymentCaptured(event);
            } else if ("payment.failed".equalsIgnoreCase(eventType)) {
                handlePaymentFailed(event);
            } else {
                log.info("Ignoring webhook event type: {}", eventType);
                markEventStatus(event, "IGNORED", null);
            }

        } catch (Exception ex) {
            log.error("Failed to process webhook event id={}: {}", event.getId(), ex.getMessage(), ex);
            markEventStatus(event, "FAILED", ex.getMessage());
        }
    }

    private void handlePaymentCaptured(WebhookEvent event) {
        String orderId = extractOrderId(event);
        if (orderId == null) {
            markEventStatus(event, "FAILED", "Missing orderId in payload");
            return;
        }

        Optional<PaymentOrder> maybeOrder = paymentOrderRepository.findByGatewayOrderId(orderId);
        if (maybeOrder.isEmpty()) {
            markEventStatus(event, "FAILED", "Order not found for gatewayOrderId=" + orderId);
            return;
        }

        PaymentOrder order = maybeOrder.get();

        // Idempotent: already completed
        if (order.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Order {} already completed, skipping", orderId);
            markEventStatus(event, "PROCESSED", null);
            return;
        }

        // Update order status
        order.setStatus(PaymentStatus.COMPLETED);
        paymentOrderRepository.save(order);
        log.info("Order {} marked as COMPLETED via webhook", orderId);

        markEventStatus(event, "PROCESSED", null);
    }

    private void handlePaymentFailed(WebhookEvent event) {
        String orderId = extractOrderId(event);
        if (orderId == null) {
            markEventStatus(event, "FAILED", "Missing orderId in payload");
            return;
        }

        Optional<PaymentOrder> maybeOrder = paymentOrderRepository.findByGatewayOrderId(orderId);
        if (maybeOrder.isEmpty()) {
            markEventStatus(event, "FAILED", "Order not found for gatewayOrderId=" + orderId);
            return;
        }

        PaymentOrder order = maybeOrder.get();
        order.setStatus(PaymentStatus.FAILED);
        paymentOrderRepository.save(order);
        log.info("Order {} marked as FAILED via webhook", orderId);

        markEventStatus(event, "PROCESSED", null);
    }

    /**
     * Extract order ID from webhook payload (supports both test and Razorpay formats)
     */
    private String extractOrderId(WebhookEvent event) {
        Map<String, Object> payload = event.getPayload();

        // Direct orderId (test format)
        if (payload.containsKey("orderId")) {
            return (String) payload.get("orderId");
        }

        // Razorpay format: payload.payment.entity.order_id
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payloadInner = (Map<String, Object>) payload.get("payload");
            if (payloadInner != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> payment = (Map<String, Object>) payloadInner.get("payment");
                if (payment != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> entity = (Map<String, Object>) payment.get("entity");
                    if (entity != null) {
                        return (String) entity.get("order_id");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract order_id from Razorpay payload: {}", e.getMessage());
        }

        return null;
    }

    private void markEventStatus(WebhookEvent event, String status, String errorMessage) {
        event.setStatus(status);
        event.setErrorMessage(errorMessage);
        event.setProcessedAt(OffsetDateTime.now());
        webhookEventRepository.save(event);
    }
}
