package in.ethiccode.paymentservice.dto.init;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PaymentInitRequest {

    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Minimum amount is 100 paise (₹1)")
    private Long amount;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^(INR|USD|EUR)$", message = "Currency must be INR, USD, or EUR")
    private String currency;

    @Size(max = 100, message = "External reference ID must be at most 100 characters")
    private String externalReferenceId;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @Valid
    private Customer customer;

    @Data
    public static class Customer {

        @Size(max = 150, message = "Name must be at most 150 characters")
        private String name;

        @Email(message = "Invalid email format")
        @Size(max = 150, message = "Email must be at most 150 characters")
        private String email;

        @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact must be 10-15 digits")
        private String contact;
    }
}
