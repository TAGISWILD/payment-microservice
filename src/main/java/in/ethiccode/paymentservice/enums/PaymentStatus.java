package in.ethiccode.paymentservice.enums;

public enum PaymentStatus {

    /** Payment has been created but not yet initiated with gateway */
    CREATED,

    /** Order initiated with payment gateway but not yet paid */
    PENDING,

    /** Payment completed successfully */
    COMPLETED,

    /** Payment failed at gateway (card decline, insufficient funds, etc.) */
    FAILED,

    /** Payment was cancelled by customer or system */
    CANCELLED,

    /** Refund was initiated to customer */
    REFUND_INITIATED,

    /** Refund successfully completed */
    REFUNDED
}
