package in.ethiccode.paymentservice.dto.status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PaymentStatusResponse {
    private String orderId;
    private String status;
    private Long amount;
    private String currency;
    private String description;
}
