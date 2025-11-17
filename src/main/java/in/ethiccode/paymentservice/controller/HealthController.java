package in.ethiccode.paymentservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/ping")
    public String ping() {
        System.out.println("Hello World");
        return "payment-service: OK";
    }
}
