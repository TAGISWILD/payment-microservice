package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.entity.WebhookEvent;
import in.ethiccode.paymentservice.enums.PaymentStatus;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import in.ethiccode.paymentservice.repository.WebhookEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class WebhookProcessorService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final WebhookEventRepository webhookEventRepository;

    public WebhookProcessorService(PaymentOrderRepository paymentOrderRepository,
                                   WebhookEventRepository webhookEventRepository) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.webhookEventRepository = webhookEventRepository;
    }

    @Transactional
    public void process(WebhookEvent event) {
        try {
            // Only handle payment.captured for now
            if (!"payment.captured".equalsIgnoreCase(event.getEventType())) {
                event.setStatus("IGNORED");
                event.setProcessedAt(OffsetDateTime.now());
                webhookEventRepository.save(event);
                return;
            }

            Map<String, Object> payload = event.getPayload();
            String orderId = (String) payload.get("orderId"); // from test-webhook.ps1

            if (orderId == null) {
                event.setStatus("FAILED");
                event.setErrorMessage("Missing orderId in payload");
                event.setProcessedAt(OffsetDateTime.now());
                webhookEventRepository.save(event);
                return;
            }

            Optional<PaymentOrder> maybeOrder =
                    paymentOrderRepository.findByGatewayOrderId(orderId);

            if (maybeOrder.isEmpty()) {
                event.setStatus("FAILED");
                event.setErrorMessage("Order not found for gatewayOrderId=" + orderId);
                event.setProcessedAt(OffsetDateTime.now());
                webhookEventRepository.save(event);
                return;
            }

            PaymentOrder order = maybeOrder.get();

            // If already completed, just mark webhook as processed
            if (order.getStatus() == PaymentStatus.COMPLETED) {
                event.setStatus("PROCESSED");
                event.setProcessedAt(OffsetDateTime.now());
                webhookEventRepository.save(event);
                return;
            }

            // ✅ Business transition
            order.setStatus(PaymentStatus.COMPLETED);
            paymentOrderRepository.save(order);

            event.setStatus("PROCESSED");
            event.setProcessedAt(OffsetDateTime.now());
            event.setErrorMessage(null);
            webhookEventRepository.save(event);

        } catch (Exception ex) {
            event.setStatus("FAILED");
            event.setErrorMessage(ex.getMessage());
            event.setProcessedAt(OffsetDateTime.now());
            webhookEventRepository.save(event);
        }
    }
}
