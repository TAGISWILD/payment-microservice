package in.ethiccode.paymentservice.dto.verify;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentVerifyRequest {

    @NotBlank(message = "Order ID is required")
    @JsonProperty("orderId")
    private String orderId;

    @NotBlank(message = "Razorpay Order ID is required")
    @JsonProperty("razorpayOrderId")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay Payment ID is required")
    @JsonProperty("razorpayPaymentId")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay Signature is required")
    @JsonProperty("razorpaySignature")
    private String razorpaySignature;
}
