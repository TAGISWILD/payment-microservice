package in.ethiccode.paymentservice.controller;



import in.ethiccode.paymentservice.controller.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByPublicId(UUID publicId);
}
