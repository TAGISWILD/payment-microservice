package in.ethiccode.paymentservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Payments {
    @GetMapping("/payment/{ID}")
    public ResponseEntity<String> getPaymentById(@PathVariable("ID") Long ID) {
        return ResponseEntity.ok("Payment ID = " + ID + " Details: ");
    }
    @PostMapping("/payment")
    public String initPayment(){

        return "Started";
    }
}
