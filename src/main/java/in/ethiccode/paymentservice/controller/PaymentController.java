package in.ethiccode.paymentservice.controller;

import in.ethiccode.paymentservice.dto.verify.PaymentVerifyRequest;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.ethiccode.paymentservice.dto.init.PaymentInitRequest;
import in.ethiccode.paymentservice.dto.init.PaymentInitResponse;
import in.ethiccode.paymentservice.service.PaymentService;

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

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(
            @RequestBody PaymentVerifyRequest request) {

        PaymentVerifyResponse response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }
}

