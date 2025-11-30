package in.ethiccode.paymentservice.dto.init;

public class PaymentInitRequest {

    private Long amount;
    private String currency;
    private String externalReferenceId;
    private String description;

    private Customer customer;

    // ---- inner class for customer info ----
    public static class Customer {
        private String name;
        private String email;
        private String contact;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getContact() { return contact; }
        public void setContact(String contact) { this.contact = contact; }
    }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getExternalReferenceId() { return externalReferenceId; }
    public void setExternalReferenceId(String externalReferenceId) { this.externalReferenceId = externalReferenceId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
