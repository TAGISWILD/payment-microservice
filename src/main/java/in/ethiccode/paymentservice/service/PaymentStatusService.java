package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import in.ethiccode.paymentservice.dto.status.PaymentStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentStatusService {

    private final PaymentOrderRepository orderRepo;

    public PaymentStatusResponse getStatus(String publicId) {
        UUID uuid = UUID.fromString(publicId);

        PaymentOrder order = orderRepo.findByPublicId(uuid)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return PaymentStatusResponse.builder()
                .orderId(order.getPublicId().toString())
                .status(order.getStatus())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .description(order.getDescription())
                .build();
    }

}
