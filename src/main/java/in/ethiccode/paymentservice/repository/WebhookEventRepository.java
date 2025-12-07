package in.ethiccode.paymentservice.repository;

import in.ethiccode.paymentservice.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
}
