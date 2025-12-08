package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.config.RazorpayProperties;
import in.ethiccode.paymentservice.dto.init.PaymentInitRequest;
import in.ethiccode.paymentservice.dto.init.PaymentInitResponse;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyRequest;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyResponse;
import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.enums.PaymentStatus;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;

    public PaymentService(PaymentOrderRepository paymentOrderRepository,
                          RazorpayClient razorpayClient,
                          RazorpayProperties razorpayProperties) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.razorpayClient = razorpayClient;
        this.razorpayProperties = razorpayProperties;
    }

    // ----------------------------------------------------
    // 1) INITIATE PAYMENT  (creates local order + Razorpay order)
    // ----------------------------------------------------
    public PaymentInitResponse initiatePayment(PaymentInitRequest req) {

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

        // build response for frontend
        PaymentInitResponse response = new PaymentInitResponse();
        response.setOrderId(order.getPublicId().toString());   // our UUID
        response.setGateway(order.getGateway());               // "RAZORPAY"
        response.setGatewayOrderId(order.getGatewayOrderId()); // order_XXXX
        response.setAmount(order.getAmount());
        response.setCurrency(order.getCurrency());
        response.setGatewayKeyId(razorpayProperties.getKeyId()); // handy for JS checkout

        return response;
    }

    // ----------------------------------------------------
    // 2) VERIFY PAYMENT (Razorpay signature verification)
    // ----------------------------------------------------
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest req) {
        // orderId here is your publicId (UUID)
        UUID publicId;
        try {
            publicId = UUID.fromString(req.getOrderId());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid orderId format");
        }

        PaymentOrder order = paymentOrderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        // Idempotent: already completed
        if (PaymentStatus.COMPLETED.equals(order.getStatus())) {
            PaymentVerifyResponse resp = new PaymentVerifyResponse();
            resp.setOrderId(order.getPublicId().toString());
            resp.setStatus(order.getStatus().name());
            resp.setMessage("Order already verified");
            return resp;
        }

        // ---- Sanity checks with Razorpay details from frontend ----
        if (!"RAZORPAY".equalsIgnoreCase(order.getGateway())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not a Razorpay order");
        }

        if (!order.getGatewayOrderId().equals(req.getRazorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay orderId mismatch");
        }

        // ---- Razorpay signature check ----
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        String generatedSignature = hmacSha256(payload, razorpayProperties.getKeySecret());

        if (!generatedSignature.equals(req.getRazorpaySignature())) {
            // mark as failed
            order.setStatus(PaymentStatus.FAILED);
            paymentOrderRepository.save(order);

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        // Signature valid → mark order as paid
        order.setStatus(PaymentStatus.COMPLETED);
        paymentOrderRepository.save(order);

        PaymentVerifyResponse resp = new PaymentVerifyResponse();
        resp.setOrderId(order.getPublicId().toString());
        resp.setStatus(order.getStatus().name());
        resp.setMessage("Payment verified via Razorpay signature");

        return resp;
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
