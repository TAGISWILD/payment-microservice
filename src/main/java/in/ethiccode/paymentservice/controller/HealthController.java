package in.ethiccode.paymentservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/ping")
    public String ping() {
        System.out.println("Hello World");
        return "payment-service: K01";
    }
    @GetMapping("/payment/{id}")
public ResponseEntity<String> getPaymentById(@PathVariable("id") Long paymentId) {
    return ResponseEntity.ok("Payment ID = " + paymentId);
}
}
