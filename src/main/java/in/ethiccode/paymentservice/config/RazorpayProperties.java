package in.ethiccode.paymentservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties {

    private String keyId;
    private String keySecret;
    private String webhookSecret;
}
