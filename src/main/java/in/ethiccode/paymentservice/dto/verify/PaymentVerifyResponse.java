package in.ethiccode.paymentservice.dto.verify;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyResponse {

    private String orderId;
    private String status;
    private String message;
}
