package in.ethiccode.paymentservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PaymentException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public PaymentException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public PaymentException(String message, HttpStatus status) {
        this(message, status, "PAYMENT_ERROR");
    }

    // Common factory methods for typical payment errors
    public static PaymentException orderNotFound(String orderId) {
        return new PaymentException(
                "Order not found: " + orderId,
                HttpStatus.NOT_FOUND,
                "ORDER_NOT_FOUND"
        );
    }

    public static PaymentException invalidSignature() {
        return new PaymentException(
                "Invalid payment signature",
                HttpStatus.BAD_REQUEST,
                "INVALID_SIGNATURE"
        );
    }

    public static PaymentException gatewayError(String message) {
        return new PaymentException(
                "Payment gateway error: " + message,
                HttpStatus.BAD_GATEWAY,
                "GATEWAY_ERROR"
        );
    }

    public static PaymentException duplicatePayment(String orderId) {
        return new PaymentException(
                "Payment already processed for order: " + orderId,
                HttpStatus.CONFLICT,
                "DUPLICATE_PAYMENT"
        );
    }
}


