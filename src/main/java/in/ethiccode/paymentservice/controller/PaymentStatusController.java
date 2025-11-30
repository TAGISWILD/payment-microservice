package in.ethiccode.paymentservice.controller;

import in.ethiccode.paymentservice.dto.status.PaymentStatusResponse;
import in.ethiccode.paymentservice.service.PaymentStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentStatusController {

    private final PaymentStatusService statusService;

    @GetMapping("/status/{publicId}")
    public PaymentStatusResponse getStatus(@PathVariable String publicId) {
        return statusService.getStatus(publicId);
    }
}
