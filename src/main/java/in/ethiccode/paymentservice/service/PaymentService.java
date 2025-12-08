package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.config.RazorpayProperties;
import in.ethiccode.paymentservice.dto.init.PaymentInitRequest;
import in.ethiccode.paymentservice.dto.init.PaymentInitResponse;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyRequest;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyResponse;
import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.enums.PaymentStatus;
import in.ethiccode.paymentservice.exception.PaymentException;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;

    // ----------------------------------------------------
    // 1) INITIATE PAYMENT  (creates local order + Razorpay order)
    // ----------------------------------------------------
    public PaymentInitResponse initiatePayment(PaymentInitRequest req) {
        log.info("Initiating payment for amount={} currency={}", req.getAmount(), req.getCurrency());

        PaymentOrder order = new PaymentOrder();
        order.setAmount(req.getAmount());
        order.setCurrency(req.getCurrency());
        order.setDescription(req.getDescription());
        order.setExternalReferenceId(req.getExternalReferenceId());
        order.setGateway("RAZORPAY");
        order.setStatus(PaymentStatus.CREATED);

        if (req.getCustomer() != null) {
            order.setCustomerName(req.getCustomer().getName());
            order.setCustomerEmail(req.getCustomer().getEmail());
            order.setCustomerContact(req.getCustomer().getContact());
        }

        // Build "receipt" for Razorpay (their reference)
        String receipt = (req.getExternalReferenceId() != null && !req.getExternalReferenceId().isBlank())
                ? req.getExternalReferenceId()
                : "ORDER-" + System.currentTimeMillis();

        // ---- CALL RAZORPAY ----
        String razorpayOrderId = razorpayClient.createOrder(
                order.getAmount(),
                order.getCurrency(),
                receipt
        );

        // store Razorpay order id in our row
        order.setGatewayOrderId(razorpayOrderId);

        // save local order (publicId will be generated in @PrePersist)
        order = paymentOrderRepository.save(order);
        log.info("Created payment order publicId={} gatewayOrderId={}", order.getPublicId(), razorpayOrderId);

        // build response for frontend using builder
        return PaymentInitResponse.builder()
                .orderId(order.getPublicId().toString())
                .gateway(order.getGateway())
                .gatewayOrderId(order.getGatewayOrderId())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .gatewayKeyId(razorpayProperties.getKeyId())
                .build();
    }

    // ----------------------------------------------------
    // 2) VERIFY PAYMENT (Razorpay signature verification)
    // ----------------------------------------------------
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest req) {
        log.info("Verifying payment for orderId={}", req.getOrderId());

        // orderId here is your publicId (UUID)
        UUID publicId = parseUuid(req.getOrderId());

        PaymentOrder order = paymentOrderRepository.findByPublicId(publicId)
                .orElseThrow(() -> PaymentException.orderNotFound(req.getOrderId()));

        // Idempotent: already completed
        if (PaymentStatus.COMPLETED.equals(order.getStatus())) {
            log.info("Order {} already verified, returning cached status", req.getOrderId());
            return PaymentVerifyResponse.builder()
                    .orderId(order.getPublicId().toString())
                    .status(order.getStatus().name())
                    .message("Order already verified")
                    .build();
        }

        // ---- Sanity checks with Razorpay details from frontend ----
        if (!"RAZORPAY".equalsIgnoreCase(order.getGateway())) {
            throw new PaymentException("Order is not a Razorpay order", HttpStatus.BAD_REQUEST, "INVALID_GATEWAY");
        }

        if (!order.getGatewayOrderId().equals(req.getRazorpayOrderId())) {
            throw new PaymentException("Razorpay orderId mismatch", HttpStatus.BAD_REQUEST, "ORDER_ID_MISMATCH");
        }

        // ---- Razorpay signature check ----
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        String generatedSignature = hmacSha256(payload, razorpayProperties.getKeySecret());

        if (!generatedSignature.equals(req.getRazorpaySignature())) {
            log.warn("Invalid signature for order {}", req.getOrderId());
            order.setStatus(PaymentStatus.FAILED);
            paymentOrderRepository.save(order);
            throw PaymentException.invalidSignature();
        }

        // Signature valid → mark order as paid
        order.setStatus(PaymentStatus.COMPLETED);
        paymentOrderRepository.save(order);
        log.info("Payment verified successfully for order {}", req.getOrderId());

        return PaymentVerifyResponse.builder()
                .orderId(order.getPublicId().toString())
                .status(order.getStatus().name())
                .message("Payment verified via Razorpay signature")
                .build();
    }

    private UUID parseUuid(String orderId) {
        try {
            return UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            throw new PaymentException("Invalid orderId format: " + orderId, HttpStatus.BAD_REQUEST, "INVALID_ORDER_ID");
        }
    }

    // ----------------------------------------------------
    // Helper: HMAC-SHA256 hex lowercase
    // ----------------------------------------------------
    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec =
                    new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(raw.length * 2);
            for (byte b : raw) {
                sb.append(String.format("%02x", b)); // lower-case hex
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }
}
