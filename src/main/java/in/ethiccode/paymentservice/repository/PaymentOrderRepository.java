package in.ethiccode.paymentservice.repository;



import in.ethiccode.paymentservice.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByPublicId(UUID publicId);

    Optional<PaymentOrder> findByExternalReferenceId(String externalReferenceId);

    Optional<PaymentOrder> findByGatewayOrderId(String gatewayOrderId);
}