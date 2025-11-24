package in.ethiccode.paymentservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import in.ethiccode.paymentservice.dto.PaymentInitRequest;
import in.ethiccode.paymentservice.dto.PaymentInitResponse;
import in.ethiccode.paymentservice.entity.PaymentOrder;
import in.ethiccode.paymentservice.repository.PaymentOrderRepository;
import org.springframework.stereotype.Service;

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
}
