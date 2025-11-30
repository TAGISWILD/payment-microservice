package in.ethiccode.paymentservice.service;

import in.ethiccode.paymentservice.dto.init.PaymentInitRequest;
import in.ethiccode.paymentservice.dto.init.PaymentInitResponse;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyRequest;
import in.ethiccode.paymentservice.dto.verify.PaymentVerifyResponse;
import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.UUID;


@Service
public class PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;

    public PaymentService(PaymentOrderRepository paymentOrderRepository) {
        this.paymentOrderRepository = paymentOrderRepository;
    }

    public PaymentInitResponse initiatePayment(PaymentInitRequest req) {

        //local payment order
        PaymentOrder order = new PaymentOrder();
        order.setAmount(req.getAmount());
        order.setCurrency(req.getCurrency());
        order.setDescription(req.getDescription());
        order.setExternalReferenceId(req.getExternalReferenceId());
        order.setStatus("CREATED");
        order.setGateway("DUMMY"); // or "RAZORPAY" later

        if (req.getCustomer() != null) {
            order.setCustomerName(req.getCustomer().getName());
            order.setCustomerEmail(req.getCustomer().getEmail());
            order.setCustomerContact(req.getCustomer().getContact());
        }

        //  save to DB
        order = paymentOrderRepository.save(order);

        // builds response for frontend
        PaymentInitResponse response = new PaymentInitResponse();
        response.setOrderId(order.getPublicId().toString());
        response.setGateway(order.getGateway());
        response.setGatewayOrderId(null); // will be real gateway order later
        response.setAmount(order.getAmount());
        response.setCurrency(order.getCurrency());

        return response;
    }
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest req) {
        UUID publicId;

        try {
            publicId = UUID.fromString(req.getOrderId());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid orderId format");
        }

        PaymentOrder order = paymentOrderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        // Idempotency: if already completed, just return
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            PaymentVerifyResponse resp = new PaymentVerifyResponse();
            resp.setOrderId(order.getPublicId().toString());
            resp.setStatus(order.getStatus());
            resp.setMessage("Order already verified");
            return resp;
        }

        // If you want to store gatewayPaymentId later, you can add a column/field.
        // For now, we just mark order as COMPLETED.
        order.setStatus("COMPLETED");
        paymentOrderRepository.save(order);

        PaymentVerifyResponse resp = new PaymentVerifyResponse();
        resp.setOrderId(order.getPublicId().toString());
        resp.setStatus(order.getStatus());
        resp.setMessage("Payment verified and order marked as COMPLETED");

        return resp;
    }
}
