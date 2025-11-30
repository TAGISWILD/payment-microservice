package in.ethiccode.paymentservice.dto.init;

public class PaymentInitResponse {

    private String orderId;
    private String gateway;       // "RAZORPAY" or "DUMMY"
    private String gatewayOrderId;// null (no eazorpay)
    private Long amount;
    private String currency;

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }

    public String getGatewayOrderId() { return gatewayOrderId; }
    public void setGatewayOrderId(String gatewayOrderId) { this.gatewayOrderId = gatewayOrderId; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
