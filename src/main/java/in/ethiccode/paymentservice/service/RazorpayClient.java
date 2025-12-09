package in.ethiccode.paymentservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.ethiccode.paymentservice.config.RazorpayProperties;
import in.ethiccode.paymentservice.exception.PaymentException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class RazorpayClient {

    private final RazorpayProperties props;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public RazorpayClient(RazorpayProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        // Configure HttpClient with proper connection pooling for concurrent requests
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();
    }

    @PostConstruct
    public void init() {
        // Validate config early
        if (props.getKeyId() == null || props.getKeyId().isBlank()
                || props.getKeySecret() == null || props.getKeySecret().isBlank()) {
            throw new IllegalStateException(
                    "Razorpay keys are missing/blank. " +
                            "Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET / application.yml");
        }

        // Masked log so you can confirm which key is used
        String kid = props.getKeyId();
        String prefix = kid.length() > 6 ? kid.substring(0, 6) : kid;
        log.info("RazorpayClient initialized with keyId prefix='{}***'", prefix);
    }

    /**
     * Creates an order on Razorpay and returns the Razorpay order id (e.g. "order_ABC123...")
     */
    public String createOrder(long amount, String currency, String receipt) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);      // paise
            body.put("currency", currency);  // e.g. "INR"
            body.put("receipt", receipt);    // your reference id
            body.put("payment_capture", 1);  // auto capture

            String json = objectMapper.writeValueAsString(body);

            // 🔐 Basic Auth header
            String auth = props.getKeyId() + ":" + props.getKeySecret();
            String basicAuth = Base64.getEncoder()
                    .encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + basicAuth)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Razorpay order create failed. Status={} body={}", response.statusCode(), response.body());
                throw PaymentException.gatewayError(
                        "Razorpay order create failed with status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode idNode = root.get("id");
            if (idNode == null || idNode.isNull()) {
                log.error("Razorpay response has no 'id': {}", response.body());
                throw PaymentException.gatewayError("Razorpay response missing order id");
            }

            String orderId = idNode.asText();
            log.info("Created Razorpay order: {}", orderId);
            return orderId;
        } catch (PaymentException pe) {
            throw pe;
        } catch (Exception ex) {
            log.error("Error calling Razorpay createOrder: {}", ex.getMessage(), ex);
            throw PaymentException.gatewayError(ex.getMessage());
        }
    }
}
