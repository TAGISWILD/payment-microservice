package in.ethiccode.paymentservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.ethiccode.paymentservice.controller.PaymentInitRequest;
import in.ethiccode.paymentservice.controller.PaymentInitResponse;
import in.ethiccode.paymentservice.controller.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/init")
    public ResponseEntity<PaymentInitResponse> initPayment(
            @RequestBody PaymentInitRequest request) {

        PaymentInitResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }
}

