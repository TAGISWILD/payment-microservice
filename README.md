# 💳 Payment Microservice

A production-ready **Payment Microservice** built with Spring Boot and React, featuring Razorpay integration for seamless payment processing.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen?style=flat-square&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-purple?style=flat-square)

---

## 🎯 Overview

This microservice provides a complete payment solution that can be integrated into any application. It handles:

- **Payment Initiation** - Create orders and generate Razorpay checkout sessions
- **Payment Verification** - Cryptographic signature verification (HMAC-SHA256)
- **Webhook Processing** - Handle async payment notifications from Razorpay
- **Payment Status** - Query payment status at any time

### 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Spring Boot    │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Razorpay     │
                        │   (Gateway)     │
                        └─────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Payments** | HMAC-SHA256 signature verification |
| 🔄 **Idempotent APIs** | Safe retry handling |
| 📊 **Webhook Support** | Real-time payment status updates |
| 🎨 **Demo Frontend** | React app with live backend activity panel |
| ✅ **Input Validation** | Jakarta Bean Validation |
| 🚨 **Error Handling** | Global exception handler with structured responses |
| 📝 **Logging** | Comprehensive SLF4J logging |

---

## 🛠️ Tech Stack

### Backend
- **Java 17+**
- **Spring Boot 3.3.5**
- **Spring Data JPA**
- **PostgreSQL**
- **Gradle**

### Frontend
- **React 18**
- **Vite**
- **Tailwind CSS**
- **React Router**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [Java 17+](https://adoptium.net/) installed
- [Node.js 18+](https://nodejs.org/) installed
- [PostgreSQL 14+](https://www.postgresql.org/) running
- [Razorpay Account](https://razorpay.com/) (Test mode is free)

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/TAGISWILD/payment-microservice.git
cd payment-microservice
```

### 2️⃣ Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE paymentdb;
CREATE USER payment_user WITH PASSWORD 'payment_pass';
GRANT ALL PRIVILEGES ON DATABASE paymentdb TO payment_user;
```

Then run the schema:

```bash
psql -U payment_user -d paymentdb -f src/main/resources/schema.sql
```

### 3️⃣ Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings → API Keys**
3. Generate **Test Mode** keys

You'll get:
- `Key ID` (starts with `rzp_test_`)
- `Key Secret`

#### Option A: Environment Variables (Recommended)

```bash
# Linux/Mac
export RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=your_secret_key
export RAZORPAY_WEBHOOK_SECRET=your_webhook_secret  # Optional

# Windows PowerShell
$env:RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
$env:RAZORPAY_KEY_SECRET="your_secret_key"
$env:RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Windows CMD
set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
set RAZORPAY_KEY_SECRET=your_secret_key
```

#### Option B: Application Properties

Edit `src/main/resources/application.yml`:

```yaml
razorpay:
  keyId: rzp_test_xxxxxxxxxxxxx
  keySecret: your_secret_key
  webhookSecret: your_webhook_secret  # Optional
```

> ⚠️ **Never commit real credentials to Git!**

### 4️⃣ Build & Run Backend

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The backend will start at **http://localhost:8081**

#### Verify it's running:

```bash
curl http://localhost:8081/ping
# Response: payment-service: K01
```

### 5️⃣ Setup & Run Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at **http://localhost:5173**

---

## ☁️ Deploying to Heroku

Backend only (Spring Boot):

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and log in  
   `heroku login`
2. Create the app on the current repo and set the stack to Heroku-22 (Java 17 ready)  
   `heroku create <your-app-name> --stack heroku-22`
3. Provision Postgres  
   `heroku addons:create heroku-postgresql:mini`
4. Set secrets (replace with your real keys)  
   `heroku config:set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...`
5. Build the fat jar locally (Heroku will also build, but this verifies)  
   `./gradlew clean bootJar`
6. Push to Heroku for deployment  
   `git push heroku main`  *(or the branch you deploy from)*
7. Run the schema once against the provisioned DB  
   `heroku run bash --app <your-app-name> -c "psql $DATABASE_URL -f src/main/resources/schema.sql"`
8. Verify health  
   `heroku open /ping`

Notes:
- `Procfile` already starts the app with `java -Dserver.port=$PORT -jar build/libs/payment-service-1.0-SNAPSHOT.jar`
- `application.yml` reads `JDBC_DATABASE_URL/USERNAME/PASSWORD` and `PORT`, which Heroku injects automatically.
- Frontend: deploy separately (e.g., Netlify/Vercel). Update its API base URL to your Heroku app.

---

## 📡 API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/payments/init` | Initiate a new payment |
| `POST` | `/api/v1/payments/verify` | Verify payment signature |
| `GET` | `/api/v1/payments/status/{orderId}` | Get payment status |
| `POST` | `/api/v1/payments/webhook` | Receive Razorpay webhooks |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check |

---

## 📝 API Usage

### Initiate Payment

```bash
curl -X POST http://localhost:8081/api/v1/payments/init \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "externalReferenceId": "ORDER-123",
    "description": "Premium Plan",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210"
    }
  }'
```

**Response:**

```json
{
  "orderId": "c19f3ab4-64e4-4d9f-95da-24bcc0381f4f",
  "gateway": "RAZORPAY",
  "gatewayOrderId": "order_9A33XWu170gUtm",
  "amount": 50000,
  "currency": "INR",
  "gatewayKeyId": "rzp_test_xxxxx"
}
```

### Verify Payment

```bash
curl -X POST http://localhost:8081/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "c19f3ab4-64e4-4d9f-95da-24bcc0381f4f",
    "razorpayOrderId": "order_9A33XWu170gUtm",
    "razorpayPaymentId": "pay_xxxxxxxxxxxxx",
    "razorpaySignature": "signature_from_razorpay"
  }'
```

### Get Payment Status

```bash
curl http://localhost:8081/api/v1/payments/status/c19f3ab4-64e4-4d9f-95da-24bcc0381f4f
```

---

## 🧪 Testing Payments

### Test Card Details

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | Any value |

### Test UPI

Use `success@razorpay` as UPI ID for successful payments.

---

## 📂 Project Structure

```
payment-microservice/
├── src/main/java/in/ethiccode/paymentservice/
│   ├── config/              # Configuration classes
│   ├── controller/          # REST controllers
│   ├── dto/                 # Data Transfer Objects
│   │   ├── init/           # Payment initiation DTOs
│   │   ├── verify/         # Payment verification DTOs
│   │   └── status/         # Payment status DTOs
│   ├── entity/              # JPA entities
│   ├── enums/               # Enumerations
│   ├── exception/           # Exception handling
│   ├── repository/          # Data repositories
│   └── service/             # Business logic
├── src/main/resources/
│   ├── application.yml      # App configuration
│   └── schema.sql           # Database schema
├── frontend/                # React application
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts
│   │   ├── data/           # Static data
│   │   └── pages/          # Page components
│   └── package.json
├── build.gradle             # Gradle build config
└── README.md
```

---

## 🔒 Security Features

- ✅ HMAC-SHA256 signature verification for payments
- ✅ Webhook signature verification
- ✅ Environment variable support for secrets
- ✅ Input validation on all endpoints
- ✅ UUID-based public IDs (no internal ID exposure)

---

## 🐛 Troubleshooting

### Common Issues

**1. Razorpay keys not found**
```
IllegalStateException: Razorpay keys are missing/blank
```
→ Ensure environment variables are set correctly

**2. Database connection failed**
```
Unable to acquire JDBC Connection
```
→ Check PostgreSQL is running and credentials are correct

**3. Frontend can't connect to backend**
```
Failed to fetch
```
→ Ensure backend is running on port 8081

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Developed by [EthicCode Technologies](https://github.com/TAGISWILD)**

- **Atharva Chauhan** - *Backend Development*
- GitHub: [@TAGISWILD](https://github.com/TAGISWILD)

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [Razorpay](https://razorpay.com/) - Payment gateway
- [React](https://react.dev/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

<p align="center">
  Made with ❤️ by EthicCode Technologies
</p>

