# Payment Microservice

Razorpay payment-service starter with a Spring Boot foundation, PostgreSQL schema, and a React demo store that shows the checkout flow end to end.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-0B72E7?style=for-the-badge)

## What It Does

This repo is a payment integration sandbox for building a production-grade payment service.

- Models payment orders, payment attempts, refunds, and webhook events in PostgreSQL
- Demonstrates a React checkout flow using Razorpay Checkout
- Includes PowerShell/API test scripts for init, verify, status, and webhook calls
- Keeps payment secrets in environment variables
- Provides a clean base for turning the service into a reusable backend module

## Architecture

```text
React demo store
      |
      |  /api/v1/payments/init
      v
Spring Boot payment service
      |
      |  orders, payments, refunds, webhook_events
      v
PostgreSQL
      |
      |  Razorpay order/payment/webhook flow
      v
Razorpay Checkout
```

## Current Status

| Layer | Status |
| --- | --- |
| React checkout demo | Present |
| PostgreSQL schema | Present |
| Razorpay test scripts | Present |
| Spring Boot project setup | Present |
| Full backend controllers/services | In progress |

## Tech Stack

| Area | Tools |
| --- | --- |
| Backend | Java, Spring Boot, Gradle |
| Database | PostgreSQL, `pgcrypto`, JSONB |
| Frontend | React, Vite, React Router, Tailwind CSS |
| Gateway | Razorpay Checkout |
| Testing | PowerShell scripts, HTML checkout test page |

## Quick Start

### 1. Clone

```bash
git clone https://github.com/TAGISWILD/payment-microservice.git
cd payment-microservice
```

### 2. Create The Database

```sql
CREATE DATABASE paymentdb;
CREATE USER payment_user WITH PASSWORD 'payment_pass';
GRANT ALL PRIVILEGES ON DATABASE paymentdb TO payment_user;
```

Then apply the schema:

```bash
psql -U payment_user -d paymentdb -f src/main/resources/schema.sql
```

### 3. Add Razorpay Test Credentials

```bash
export RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=your_test_secret
export RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Never commit real payment credentials.

### 4. Run Backend

```bash
./gradlew bootRun
```

Default backend port: `8081`

### 5. Run Frontend Demo

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Planned API Surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/payments/init` | Create local order and Razorpay order |
| `POST` | `/api/v1/payments/verify` | Verify Razorpay payment signature |
| `GET` | `/api/v1/payments/status/{orderId}` | Read payment/order status |
| `POST` | `/api/v1/payments/webhook` | Receive Razorpay webhook events |

## Database Model

The schema is designed around five core tables:

| Table | Purpose |
| --- | --- |
| `api_clients` | Optional client/tenant access layer |
| `payment_orders` | Intent to pay, gateway order mapping, customer metadata |
| `payments` | Payment attempts and final payment state |
| `refunds` | Refund tracking |
| `webhook_events` | Idempotent webhook processing |

## Test Helpers

The `tests/` directory contains scripts for local API testing:

| File | Use |
| --- | --- |
| `test-payment.ps1` | Calls payment init |
| `test-verify.ps1` | Calls verify endpoint with a dummy payment id |
| `test-verify-razorpay.ps1` | Generates an HMAC-style Razorpay test signature |
| `test-status.ps1` | Reads order status |
| `test-webhook.ps1` | Sends a sample webhook payload |
| `test-pay.html` | Minimal Razorpay Checkout page |

## Roadmap

- Implement Spring Boot controllers and service layer from the planned API surface
- Add DTO validation and structured error responses
- Add webhook idempotency handling against `webhook_events`
- Add integration tests for init, verify, status, and webhook flows
- Add Docker Compose for PostgreSQL + backend + frontend

## Why This Repo Exists

Payment integrations become messy fast: gateway IDs, local order IDs, webhooks, retries, signatures, and database state all have to agree. This repo is the foundation for a small, understandable payment service that can grow into a real internal module.

## License

MIT
