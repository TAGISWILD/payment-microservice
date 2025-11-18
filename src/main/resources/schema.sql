------------------------------------------------------------
--  EXTENSIONS
------------------------------------------------------------

-- Enables gen_random_uuid() for public_id columns
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


------------------------------------------------------------
--  API CLIENTS (optional but generic + scalable)
--  Represents applications/tenants allowed to use this service
------------------------------------------------------------

CREATE TABLE api_clients (
                             id              BIGSERIAL PRIMARY KEY,
                             name            VARCHAR(100) NOT NULL,
                             api_key         VARCHAR(200) NOT NULL,  -- store hashed or raw token
                             is_active       BOOLEAN NOT NULL DEFAULT TRUE,

                             created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                             updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_api_clients_api_key
    ON api_clients (api_key);


------------------------------------------------------------
--  PAYMENT ORDERS (generic "intent to pay")
------------------------------------------------------------

CREATE TABLE payment_orders (
                                id                      BIGSERIAL PRIMARY KEY,
                                public_id               UUID NOT NULL DEFAULT gen_random_uuid(),

                                client_id               BIGINT REFERENCES api_clients(id),

                                external_reference_id   VARCHAR(100),       -- caller’s own reference
                                amount                  BIGINT NOT NULL,    -- paise/cents
                                currency                VARCHAR(10) NOT NULL,

                                gateway                 VARCHAR(50) NOT NULL,
                                gateway_order_id        VARCHAR(100) NOT NULL,

                                status                  VARCHAR(20) NOT NULL,   -- CREATED | EXPIRED | COMPLETED
                                description             TEXT,

                                customer_name           VARCHAR(150),
                                customer_email          VARCHAR(150),
                                customer_contact        VARCHAR(20),

                                metadata                JSONB,                -- flexible field

                                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_payment_orders_public_id
    ON payment_orders (public_id);

CREATE UNIQUE INDEX ux_payment_orders_gateway_order
    ON payment_orders (gateway, gateway_order_id);

CREATE INDEX ix_payment_orders_external_ref
    ON payment_orders (external_reference_id);


------------------------------------------------------------
--  PAYMENTS (actual payment attempts/transactions)
------------------------------------------------------------

CREATE TABLE payments (
                          id                      BIGSERIAL PRIMARY KEY,
                          public_id               UUID NOT NULL DEFAULT gen_random_uuid(),

                          order_id                BIGINT NOT NULL REFERENCES payment_orders(id) ON DELETE CASCADE,

                          gateway                 VARCHAR(50) NOT NULL,
                          gateway_payment_id      VARCHAR(100) NOT NULL,

                          amount                  BIGINT NOT NULL,
                          currency                VARCHAR(10) NOT NULL,

                          status                  VARCHAR(20) NOT NULL,      -- PENDING | SUCCESS | FAILED | REFUNDED
                          failure_code            VARCHAR(100),
                          failure_reason          TEXT,

                          raw_payload             JSONB,                     -- latest gateway/Webhook payload

                          created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_payments_public_id
    ON payments (public_id);

CREATE UNIQUE INDEX ux_payments_gateway_payment
    ON payments (gateway, gateway_payment_id);

CREATE INDEX ix_payments_order_id
    ON payments (order_id);

CREATE INDEX ix_payments_status
    ON payments (status);


------------------------------------------------------------
--  REFUNDS (refund operations)
------------------------------------------------------------

CREATE TABLE refunds (
                         id                      BIGSERIAL PRIMARY KEY,
                         public_id               UUID NOT NULL DEFAULT gen_random_uuid(),

                         payment_id              BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,

                         gateway                 VARCHAR(50) NOT NULL,
                         gateway_refund_id       VARCHAR(100) NOT NULL,

                         amount                  BIGINT NOT NULL,
                         currency                VARCHAR(10) NOT NULL,

                         status                  VARCHAR(20) NOT NULL,      -- PENDING | SUCCESS | FAILED
                         failure_code            VARCHAR(100),
                         failure_reason          TEXT,

                         raw_payload             JSONB,

                         created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_refunds_public_id
    ON refunds (public_id);

CREATE UNIQUE INDEX ux_refunds_gateway_refund
    ON refunds (gateway, gateway_refund_id);

CREATE INDEX ix_refunds_payment_id
    ON refunds (payment_id);


------------------------------------------------------------
--  WEBHOOK EVENTS (idempotency protection)
------------------------------------------------------------

CREATE TABLE webhook_events (
                                id                      BIGSERIAL PRIMARY KEY,

                                gateway                 VARCHAR(50) NOT NULL,
                                event_id                VARCHAR(150) NOT NULL,     -- unique per event
                                event_type              VARCHAR(100),

                                payload                 JSONB NOT NULL,

                                processed               BOOLEAN NOT NULL DEFAULT FALSE,
                                processed_at            TIMESTAMPTZ,

                                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_webhook_events_gateway_event
    ON webhook_events (gateway, event_id);


------------------------------------------------------------
--  STATUS CONSTRAINTS (enum-like)
------------------------------------------------------------

ALTER TABLE payment_orders
    ADD CONSTRAINT chk_payment_orders_status
        CHECK (status IN ('CREATED', 'EXPIRED', 'COMPLETED'));

ALTER TABLE payments
    ADD CONSTRAINT chk_payments_status
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'));

ALTER TABLE refunds
    ADD CONSTRAINT chk_refunds_status
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED'));


------------------------------------------------------------
--  TRIGGERS: Auto-update updated_at fields
------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_payment_orders_updated
    BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_refunds_updated
    BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
