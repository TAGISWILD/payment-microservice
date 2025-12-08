package in.ethiccode.paymentservice.dto.verify;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentVerifyRequest {

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("razorpayOrderId")
    private String razorpayOrderId;

    @JsonProperty("razorpayPaymentId")
    private String razorpayPaymentId;

    @JsonProperty("razorpaySignature")
    private String razorpaySignature;
}
