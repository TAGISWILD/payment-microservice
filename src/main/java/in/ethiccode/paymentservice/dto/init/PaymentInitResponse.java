package in.ethiccode.paymentservice.dto.init;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitResponse {

    private String orderId;
    private String gateway;         // "RAZORPAY" or "DUMMY"
    private String gatewayOrderId;  // Razorpay order ID (order_XXX)
    private Long amount;
    private String currency;
    private String gatewayKeyId;    // Razorpay key to use in Checkout
}
