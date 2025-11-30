package in.ethiccode.paymentservice.dto.verify;
public class PaymentVerifyRequest {

    // This is the publicId (UUID) returned by /init
    private String orderId;

    // Optional for now – useful when you plug in Razorpay
    private String gatewayPaymentId;

    // getters & setters

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getGatewayPaymentId() {
        return gatewayPaymentId;
    }

    public void setGatewayPaymentId(String gatewayPaymentId) {
        this.gatewayPaymentId = gatewayPaymentId;
    }
}
